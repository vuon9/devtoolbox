import React, { useState, useCallback } from 'react';
import { Undo2, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { textUtilitiesAPI } from './api/textUtilitiesAPI';

const ESCAPE_METHODS = ['String Literal', 'Unicode/Hex'];

const TOOL_TITLE = 'Text Utilities';
const TOOL_DESCRIPTION = 'Sort, deduplicate, case-convert, escape, and inspect text.';

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

function ToolPane({ label, value, onChange, readOnly, placeholder, indicator, indicatorColor }) {
  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(value);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          {indicator && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor:
                  indicatorColor === 'green'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)',
                color: indicatorColor === 'green' ? '#22c55e' : '#3b82f6',
              }}
            >
              {indicator}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!value}
          title="Copy to clipboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: value ? '#a1a1aa' : '#3f3f46',
            cursor: value ? 'pointer' : 'not-allowed',
          }}
        >
          <Copy style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          flex: 1,
          width: '100%',
          padding: '12px',
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          fontSize: '14px',
          lineHeight: 1.6,
          backgroundColor: '#18181b',
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

function StatBadge({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: '#18181b',
        borderRadius: '6px',
        border: '1px solid #27272a',
      }}
    >
      <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontSize: '14px',
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          fontWeight: 600,
          color: '#f4f4f5',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const cases = [
  { id: 'upper', label: 'UPPER' },
  { id: 'lower', label: 'lower' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'sentence', label: 'Sentence' },
];

export default function TextUtilities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0, bytes: 0, sentences: 0 });
  const [escapeMethod, setEscapeMethod] = useState(ESCAPE_METHODS[0]);
  const [escapeMode, setEscapeMode] = useState('Escape');
  const [escapeResult, setEscapeResult] = useState('');

  const updateOutput = useCallback(async (text) => {
    if (!text) {
      setOutput('');
      setStats({ chars: 0, words: 0, lines: 0, bytes: 0, sentences: 0 });
      return;
    }
    setOutput(text);
    const s = await textUtilitiesAPI.GetStats(text);
    setStats(s);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const text = e.target.value;
      setInput(text);
      updateOutput(text);
    },
    [updateOutput]
  );

  const handleSort = useCallback(async () => {
    if (!input) return;
    const result = await textUtilitiesAPI.SortLines(input, false);
    setOutput(result);
    setInput(result);
  }, [input]);

  const handleSortDesc = useCallback(async () => {
    if (!input) return;
    const result = await textUtilitiesAPI.SortLines(input, true);
    setOutput(result);
    setInput(result);
  }, [input]);

  const handleDedupe = useCallback(async () => {
    if (!input) return;
    const result = await textUtilitiesAPI.RemoveDuplicates(input);
    setOutput(result);
    setInput(result);
  }, [input]);

  const handleTrim = useCallback(async () => {
    if (!input) return;
    const result = await textUtilitiesAPI.TrimLines(input);
    setOutput(result);
    setInput(result);
  }, [input]);

  const handleRemoveEmpty = useCallback(async () => {
    if (!input) return;
    const result = await textUtilitiesAPI.RemoveEmptyLines(input);
    setOutput(result);
    setInput(result);
  }, [input]);

  const handleConvertCase = useCallback(
    async (targetCase) => {
      if (!input) return;
      const result = await textUtilitiesAPI.ConvertCase(input, targetCase);
      setOutput(result);
      setInput(result);
    },
    [input]
  );

  const handleEscape = useCallback(async () => {
    if (!input) return;
    const isEscape = escapeMode === 'Escape';
    const result = isEscape
      ? await textUtilitiesAPI.Escape(input, escapeMethod)
      : await textUtilitiesAPI.Unescape(input, escapeMethod);
    setEscapeResult(result);
  }, [input, escapeMethod, escapeMode]);

  const handleReset = useCallback(() => {
    setInput('');
    setOutput('');
    setEscapeResult('');
    setStats({ chars: 0, words: 0, lines: 0, bytes: 0, sentences: 0 });
  }, []);

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
      <ToolHeader title={TOOL_TITLE} description={TOOL_DESCRIPTION} />
      <div style={{ borderBottom: '1px solid #27272a', marginBottom: '16px' }} />

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
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
          Quick Actions:
        </span>
        <Button size="sm" onClick={handleSort}>
          <ArrowUp style={{ width: '14px', height: '14px' }} /> Asc
        </Button>
        <Button size="sm" onClick={handleSortDesc}>
          <ArrowDown style={{ width: '14px', height: '14px' }} /> Desc
        </Button>
        <Button size="sm" onClick={handleDedupe}>
          <ArrowUpDown style={{ width: '14px', height: '14px' }} /> Dedupe
        </Button>
        <Button size="sm" onClick={handleTrim}>
          Trim
        </Button>
        <Button size="sm" onClick={handleRemoveEmpty}>
          Rm Empty
        </Button>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a' }} />
        <Button variant="danger" onClick={handleReset}>
          <Undo2 style={{ width: '14px', height: '14px' }} /> Reset
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          flex: 1,
          minHeight: 0,
        }}
      >
        <ToolPane
          label="Input Text"
          value={input}
          onChange={handleInputChange}
          placeholder="Paste or type text here..."
          indicator="Source"
          indicatorColor="green"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column' }}>
            <ToolPane
              label="Result"
              value={output}
              readOnly
              placeholder="Transformed text will appear here..."
              indicator="Output"
              indicatorColor="blue"
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            <StatBadge label="Chars" value={stats.chars.toLocaleString()} />
            <StatBadge label="Words" value={stats.words.toLocaleString()} />
            <StatBadge label="Lines" value={stats.lines.toLocaleString()} />
            <StatBadge label="Bytes" value={stats.bytes.toLocaleString()} />
            <StatBadge label="Sentences" value={stats.sentences.toLocaleString()} />
          </div>

          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#1c1917',
              border: '1px solid #27272a',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#71717a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Case Conversion
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {cases.map((c) => (
                <Button key={c.id} size="sm" onClick={() => handleConvertCase(c.id)}>
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#1c1917',
              border: '1px solid #27272a',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#71717a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Escape / Unescape
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={escapeMethod}
                onChange={(e) => setEscapeMethod(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  color: '#f4f4f5',
                  outline: 'none',
                }}
              >
                {ESCAPE_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  padding: '3px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEscapeMode('Escape')}
                  style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: escapeMode === 'Escape' ? '#27272a' : 'transparent',
                    color: escapeMode === 'Escape' ? '#f4f4f5' : '#71717a',
                  }}
                >
                  Escape
                </button>
                <button
                  type="button"
                  onClick={() => setEscapeMode('Unescape')}
                  style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: escapeMode === 'Unescape' ? '#27272a' : 'transparent',
                    color: escapeMode === 'Unescape' ? '#f4f4f5' : '#71717a',
                  }}
                >
                  Unescape
                </button>
              </div>
              <Button size="sm" onClick={handleEscape}>
                Run
              </Button>
              {escapeResult && (
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                    color: '#22c55e',
                    wordBreak: 'break-all',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {escapeResult}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
