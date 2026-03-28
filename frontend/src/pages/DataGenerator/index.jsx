import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Play,
  FileJson,
  FileType,
  FileCode,
  Columns,
  Trash2,
  Plus,
  HelpCircle,
  X,
} from 'lucide-react';
import { Generate } from '../../services/dataGeneratorService';
import { OUTPUT_FORMAT_OPTIONS, SEPARATOR_OPTIONS, HELP_CONTENT } from './constants';

const formats = [
  { id: 'json', label: 'JSON', icon: FileJson },
  { id: 'csv', label: 'CSV', icon: FileType },
  { id: 'raw', label: 'Raw', icon: FileCode },
  { id: 'xml', label: 'XML', icon: FileCode },
  { id: 'yaml', label: 'YAML', icon: FileType },
];

// Inline styled components
function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2
        style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}
      >
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px' }}>{description}</p>
    </div>
  );
}

function ToolTextArea({ label, value, onChange, placeholder, readOnly }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '300px',
          padding: '12px',
          fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
          fontSize: '13px',
          lineHeight: 1.5,
          backgroundColor: readOnly ? '#1c1917' : '#18181b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          color: '#f4f4f5',
          resize: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}

function ToolSplitPane({ children, isVertical }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr',
        gap: '16px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '6px',
          color: '#f4f4f5',
          fontSize: '14px',
          outline: 'none',
          minWidth: '140px',
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Input({ label, type, value, onChange, placeholder, min, max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      <input
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{
          padding: '8px 12px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '6px',
          color: '#f4f4f5',
          fontSize: '14px',
          outline: 'none',
          width: '100px',
        }}
      />
    </div>
  );
}

function SchemaField({ label, type, onRemove }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        backgroundColor: '#1c1917',
      }}
    >
      <input
        value={label}
        readOnly
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '13px',
          background: 'transparent',
          border: 'none',
          color: '#f4f4f5',
          width: '100px',
        }}
      />
      <span style={{ flex: 1, fontSize: '12px', color: '#71717a', fontStyle: 'italic' }}>
        {type}
      </span>
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#71717a',
          cursor: 'pointer',
          padding: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ef4444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#71717a';
        }}
      >
        <Trash2 style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}

function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#18181b',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid #27272a',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #27272a',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5' }}>
            Documentation & Help
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '8px', color: '#f4f4f5' }}>{HELP_CONTENT.syntax.title}</h4>
            <p style={{ marginBottom: '16px', color: '#a1a1aa' }}>
              {HELP_CONTENT.syntax.description}
            </p>
            <div
              style={{
                backgroundColor: '#09090b',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #27272a',
              }}
            >
              {HELP_CONTENT.syntax.examples.map((ex, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: idx < HELP_CONTENT.syntax.examples.length - 1 ? '12px' : 0,
                    alignItems: 'center',
                  }}
                >
                  <code
                    style={{
                      backgroundColor: '#27272a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      minWidth: '300px',
                      color: '#22c55e',
                    }}
                  >
                    {ex.syntax}
                  </code>
                  <span style={{ color: '#a1a1aa', fontSize: '13px' }}>{ex.desc}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h4 style={{ marginBottom: '8px', color: '#f4f4f5' }}>Available Functions</h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
              }}
            >
              {HELP_CONTENT.functions.map((func, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    backgroundColor: '#1c1917',
                    borderRadius: '6px',
                    border: '1px solid #27272a',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#f4f4f5',
                      marginBottom: '4px',
                    }}
                  >
                    {func.category}
                  </div>
                  <code style={{ fontSize: '11px', color: '#a1a1aa' }}>{func.items}</code>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function DataGenerator() {
  const [format, setFormat] = useState('json');
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('datagen-layout') === 'vertical'
  );
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('datagen-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  // Default schema fields
  const defaultSchema = [
    { label: 'id', type: 'UUID' },
    { label: 'name', type: 'Name' },
    { label: 'email', type: 'Email' },
    { label: 'phone', type: 'Phone' },
    { label: 'created_at', type: 'Date' },
  ];

  // Map schema types to gofakeit template functions
  const typeToTemplate = {
    'UUID': '{{UUID}}',
    'Name': '{{Name}}',
    'FirstName': '{{FirstName}}',
    'LastName': '{{LastName}}',
    'Email': '{{Email}}',
    'Phone': '{{Phone}}',
    'Date': '{{Date}}',
    'DateTime': '{{DateTime}}',
    'Boolean': '{{Boolean}}',
    'Int': '{{Int 1 100}}',
    'Float': '{{Float 1.0 100.0}}',
    'String': '{{LoremSentence 5}}',
    'URL': '{{URL}}',
    'Address': '{{Address}}',
    'City': '{{City}}',
    'Country': '{{Country}}',
    'Company': '{{Company}}',
    'JobTitle': '{{JobTitle}}',
    'Price': '{{Price 1.0 100.0}}',
  };

  // Build template from schema
  const buildTemplate = (schema, format) => {
    const fields = schema.map(field => {
      const template = typeToTemplate[field.type] || '{{UUID}}';
      return `  "${field.label}": ${template}`;
    }).join(',\n');
    
    return `{\n${fields}\n}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const template = buildTemplate(defaultSchema, format);
      const res = await Generate({ format, count, template });
      if (res && res.output) {
        setOutput(res.output);
      } else if (res && res.error) {
        setOutput(`Error: ${res.error}`);
      } else {
        setOutput(JSON.stringify(res, null, 2));
      }
    } catch (err) {
      console.error(err);
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        overflow: 'hidden',
        backgroundColor: '#09090b',
      }}
    >
      <ToolHeader
        title="Data Generator"
        description="Generate mock data for testing and development. Create realistic datasets in JSON, CSV, or raw formats."
      />

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272a',
          paddingBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Select label="Format" value={format} onChange={setFormat} options={formats} />
          <Input
            label="Count"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            min={10}
            max={1000}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Play style={{ width: '14px', height: '14px' }} />
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          <Button variant="ghost" onClick={() => setShowHelp(true)}>
            <HelpCircle style={{ width: '14px', height: '14px' }} />
            Help
          </Button>
          <div
            style={{ width: '1px', height: '16px', backgroundColor: '#27272a', margin: '0 8px' }}
          />
          <Button variant="ghost" onClick={() => setIsVertical(!isVertical)}>
            <Columns
              style={{
                width: '14px',
                height: '14px',
                transform: isVertical ? 'rotate(90deg)' : 'none',
              }}
            />
          </Button>
        </div>
      </div>

      <ToolSplitPane isVertical={isVertical}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            border: '1px solid #27272a',
            borderRadius: '8px',
            backgroundColor: '#18181b',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #27272a',
              backgroundColor: '#1c1917',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Schema Definition
            </span>
            <Button variant="ghost" size="sm">
              <Plus style={{ width: '14px', height: '14px' }} />
              Add Field
            </Button>
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {defaultSchema.map((field, idx) => (
              <SchemaField key={idx} label={field.label} type={field.type} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ToolTextArea
            label="Generated Output"
            value={output}
            readOnly
            placeholder="Generated data will appear here..."
          />
          {output && (
            <div style={{ marginTop: '12px' }}>
              <Button variant="ghost" onClick={handleCopy}>
                Copy to Clipboard
              </Button>
            </div>
          )}
        </div>
      </ToolSplitPane>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
