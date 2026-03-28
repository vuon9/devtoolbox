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
  Copy,
} from 'lucide-react';
import { Generate } from '../../services/dataGeneratorService';
import { HELP_CONTENT } from './constants';

const formats = [
  { id: 'json', label: 'JSON', icon: FileJson },
  { id: 'csv', label: 'CSV', icon: FileType },
  { id: 'raw', label: 'Raw', icon: FileCode },
  { id: 'xml', label: 'XML', icon: FileCode },
  { id: 'yaml', label: 'YAML', icon: FileType },
];

// Schema field types available in gofakeit
const fieldTypes = [
  // UUID & IDs
  'UUID', 'ULID',
  // Person
  'FirstName', 'LastName', 'Name', 'Gender', 'Email', 'Phone',
  // Internet
  'Username', 'URL', 'Domain', 'IP', 'Password',
  // Address
  'Street', 'City', 'State', 'Zip', 'Country', 'Latitude', 'Longitude',
  // Company & Job
  'Company', 'JobTitle',
  // Date
  'Past', 'Future', 'Recent', 'Birthday',
  // Number
  'Int', 'Float', 'Price',
  // Lorem
  'Word', 'Sentence', 'Paragraph',
  // Other
  'Bool',
];

// Map schema types to gofakeit template functions
// Strings need quotes, numbers/bools don't
const typeToTemplate = {
  // UUID & IDs
  'UUID': '"{{UUID}}"',
  'ULID': '"{{ULID}}"',
  // Person
  'FirstName': '"{{FirstName}}"',
  'LastName': '"{{LastName}}"',
  'Name': '"{{Name}}"',
  'Gender': '"{{Gender}}"',
  'Email': '"{{Email}}"',
  'Phone': '"{{Phone}}"',
  // Internet
  'Username': '"{{Username}}"',
  'URL': '"{{URL}}"',
  'Domain': '"{{Domain}}"',
  'IP': '"{{IP}}"',
  'Password': '"{{Password}}"',
  // Address
  'Street': '"{{Street}}"',
  'City': '"{{City}}"',
  'State': '"{{State}}"',
  'Zip': '"{{Zip}}"',
  'Country': '"{{Country}}"',
  'Latitude': '{{Latitude}}',
  'Longitude': '{{Longitude}}',
  // Company & Job
  'Company': '"{{Company}}"',
  'JobTitle': '"{{JobTitle}}"',
  // Date
  'Past': '"{{Past}}"',
  'Future': '"{{Future}}"',
  'Recent': '"{{Recent}}"',
  'Birthday': '"{{Birthday}}"',
  // Number (no quotes for non-strings)
  'Int': '{{Int 1 100}}',
  'Float': '{{Float 1.0 100.0}}',
  'Price': '{{Price 1.0 100.0}}',
  // Lorem
  'Word': '"{{Word}}"',
  'Sentence': '"{{Sentence}}"',
  'Paragraph': '"{{Paragraph}}"',
  // Other
  'Bool': '{{Bool}}',
};

// Default schema fields
const defaultSchemaFields = [
  { label: 'id', type: 'UUID' },
  { label: 'name', type: 'Name' },
  { label: 'email', type: 'Email' },
  { label: 'phone', type: 'Phone' },
  { label: 'created_at', type: 'Recent' },
];

// Inline styled components
function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}>
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px' }}>{description}</p>
    </div>
  );
}

function ToolTextArea({ label, value, onChange, placeholder, readOnly }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr',
      gap: '16px',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// Inline styled Select dropdown (like TextConverter)
function SelectDropdown({ label, value, onChange, options, width = '160px' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.id === value || o.value === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: width,
            height: '32px',
            padding: '0 12px',
            backgroundColor: isOpen ? '#27272a' : '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            color: '#f4f4f5',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.borderColor = '#52525b';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = '#18181b';
              e.currentTarget.style.borderColor = '#3f3f46';
            }
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption?.label || selectedOption?.id || value}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1c1917',
            border: '1px solid #27272a',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.id || opt.value}
                  onClick={() => { onChange(opt.id || opt.value); setIsOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: (value === opt.id || value === opt.value) ? '#f4f4f5' : '#a1a1aa',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#27272a';
                    e.currentTarget.style.color = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = (value === opt.id || value === opt.value) ? '#f4f4f5' : '#a1a1aa';
                  }}
                >
                  {Icon && <Icon style={{ width: '16px', height: '16px' }} />}
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Grouped select dropdown for field types
function GroupedSelectDropdown({ label, value, onChange, groups, width = '200px' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find current value across all groups
  const allOptions = groups.flatMap(g => g.items);
  const selectedOption = allOptions.find(o => o === value);
  
  // Find group name for selected value
  const selectedGroup = groups.find(g => g.items.includes(value));

  return (
    <div style={{ position: 'relative', width }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '32px',
          padding: '0 8px',
          backgroundColor: isOpen ? '#27272a' : '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '4px',
          color: '#f4f4f5',
          fontSize: '13px',
          cursor: 'pointer',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.borderColor = '#52525b';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#18181b';
            e.currentTarget.style.borderColor = '#3f3f46';
          }
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace" }}>
          {value || 'Select type'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#1c1917',
          border: '1px solid #27272a',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 50,
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {groups.map((group) => (
            <div key={group.name}>
              <div style={{
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#52525b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #27272a',
                backgroundColor: '#09090b',
              }}>
                {group.name}
              </div>
              {group.items.map((item) => (
                <div
                  key={item}
                  onClick={() => { onChange(item); setIsOpen(false); }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: value === item ? '#22c55e' : '#a1a1aa',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    backgroundColor: value === item ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== item) {
                      e.currentTarget.style.backgroundColor = '#27272a';
                      e.currentTarget.style.color = '#f4f4f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== item) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#a1a1aa';
                    }
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Field type groups for grouped dropdown
const fieldTypeGroups = [
  { name: 'Identity', items: ['UUID', 'ULID'] },
  { name: 'Profile', items: ['FirstName', 'LastName', 'Name', 'Gender', 'Email', 'Phone', 'JobTitle', 'Company'] },
  { name: 'Location', items: ['Street', 'City', 'State', 'Zip', 'Country', 'Latitude', 'Longitude'] },
  { name: 'Web', items: ['URL', 'Domain', 'IP', 'Username', 'Password'] },
  { name: 'Dates', items: ['Past', 'Future', 'Recent', 'Birthday'] },
  { name: 'Numbers', items: ['Int', 'Float', 'Price', 'Bool'] },
  { name: 'Text', items: ['Word', 'Sentence', 'Paragraph'] },
];

function Input({ label, type, value, onChange, placeholder, min, max, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
          padding: '0 12px',
          height: '32px',
          width: '80px',
          backgroundColor: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          color: '#f4f4f5',
          fontSize: '14px',
          outline: 'none',
        }}
      />
    </div>
  );
}

function SchemaField({ field, index, onUpdate, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #27272a', backgroundColor: '#1c1917' }}>
      <input
        value={field.label}
        onChange={(e) => onUpdate(index, 'label', e.target.value)}
        placeholder="Field name"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', background: 'transparent', border: 'none', color: '#f4f4f5', width: '120px', outline: 'none' }}
      />
      <GroupedSelectDropdown
        value={field.type}
        onChange={(val) => onUpdate(index, 'type', val)}
        groups={fieldTypeGroups}
        width="160px"
      />
      <button
        onClick={() => onRemove(index)}
        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
      >
        <Trash2 style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}

function HelpModal({ open, onClose }) {
  if (!open) return null;
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#18181b', borderRadius: '12px', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto', border: '1px solid #27272a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5' }}>Documentation & Help</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ marginBottom: '8px', color: '#f4f4f5' }}>{HELP_CONTENT.syntax.title}</h4>
            <p style={{ marginBottom: '16px', color: '#a1a1aa' }}>{HELP_CONTENT.syntax.description}</p>
            <div style={{ backgroundColor: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
              {HELP_CONTENT.syntax.examples.map((ex, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: idx < HELP_CONTENT.syntax.examples.length - 1 ? '12px' : 0, alignItems: 'center' }}>
                  <code style={{ backgroundColor: '#27272a', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', minWidth: '300px', color: '#22c55e' }}>
                    {ex.syntax}
                  </code>
                  <span style={{ color: '#a1a1aa', fontSize: '13px' }}>{ex.desc}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h4 style={{ marginBottom: '8px', color: '#f4f4f5' }}>Available Functions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
              {HELP_CONTENT.functions.map((func, idx) => (
                <div key={idx} style={{ padding: '12px', backgroundColor: '#1c1917', borderRadius: '6px', border: '1px solid #27272a' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5', marginBottom: '4px' }}>{func.category}</div>
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
  const [schema, setSchema] = useState(defaultSchemaFields);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVertical, setIsVertical] = useState(() => localStorage.getItem('datagen-layout') === 'vertical');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('datagen-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  // Build template from schema
  const buildTemplate = (schemaFields) => {
    const fields = schemaFields.map(field => {
      const template = typeToTemplate[field.type] || '"{{UUID}}"';
      return `  "${field.label}": ${template}`;
    }).join(',\n');
    
    return `{\n${fields}\n}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const template = buildTemplate(schema);
      const res = await Generate({ format, count, template });
      
      if (res && res.output) {
        try {
          const parsed = JSON.parse(res.output);
          
          // If it's an array of strings, parse each one
          if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
            const objects = parsed.map(str => {
              try {
                return JSON.parse(str);
              } catch {
                return { raw: str };
              }
            });
            setOutput(JSON.stringify(objects, null, 2));
          } else {
            setOutput(JSON.stringify(parsed, null, 2));
          }
        } catch {
          setOutput(res.output);
        }
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

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const addField = () => {
    setSchema([...schema, { label: `field_${schema.length + 1}`, type: 'String' }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...schema];
    updated[index] = { ...updated[index], [key]: value };
    setSchema(updated);
  };

  const removeField = (index) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden', backgroundColor: '#09090b' }}>
      <ToolHeader
        title="Data Generator"
        description="Generate mock data for testing and development. Create realistic datasets in JSON, CSV, or raw formats."
      />

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <SelectDropdown label="Format" value={format} onChange={setFormat} options={formats} />
          <Input label="Count" type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value) || 10)} min={10} max={1000} />
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
          <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a', margin: '0 8px' }} />
          <Button variant="ghost" onClick={() => setIsVertical(!isVertical)}>
            <Columns style={{ width: '14px', height: '14px', transform: isVertical ? 'rotate(90deg)' : 'none' }} />
          </Button>
        </div>
      </div>

      <ToolSplitPane isVertical={isVertical}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #27272a', borderRadius: '8px', backgroundColor: '#18181b', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #27272a', backgroundColor: '#1c1917' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Schema Definition ({schema.length} fields)
            </span>
            <Button variant="ghost" size="sm" onClick={addField}>
              <Plus style={{ width: '14px', height: '14px' }} />
              Add Field
            </Button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {schema.map((field, idx) => (
              <SchemaField key={idx} field={field} index={idx} onUpdate={updateField} onRemove={removeField} />
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
              <Button onClick={handleCopy} style={{ backgroundColor: '#059669' }}>
                <Copy style={{ width: '14px', height: '14px' }} />
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