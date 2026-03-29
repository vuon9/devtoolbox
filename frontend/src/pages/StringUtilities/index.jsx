import React, { useState } from 'react';
import { Undo2, Copy, ArrowUpDown, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import CaseConverterPane from './components/CaseConverterPane';
import { sortLines, removeDuplicates, getTextStats, trimLines, removeEmptyLines } from './strings';

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

function ToolPane({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  indicator,
  indicatorColor,
  style = {},
}) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        ...style,
      }}
    >
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
                    : indicatorColor === 'blue'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(113, 113, 122, 0.15)',
                color:
                  indicatorColor === 'green'
                    ? '#22c55e'
                    : indicatorColor === 'blue'
                      ? '#3b82f6'
                      : '#71717a',
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
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (value) {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#f4f4f5';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = value ? '#a1a1aa' : '#3f3f46';
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
          fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
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
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          color: '#f4f4f5',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function StringUtilities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sortMode, setSortMode] = useState('none');
  const [dedupe, setDedupe] = useState(false);

  const stats = getTextStats(output || input);

  const handleSortToggle = () => {
    const modes = ['none', 'asc', 'desc'];
    const currentIndex = modes.indexOf(sortMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    setSortMode(newMode);
    applySort(newMode, dedupe);
  };

  const handleDedupeToggle = () => {
    const newDedupe = !dedupe;
    setDedupe(newDedupe);
    applySort(sortMode, newDedupe);
  };

  const applySort = (mode = sortMode, doDedupe = dedupe) => {
    let result = input;
    if (mode === 'asc') {
      result = sortLines(result, { reverse: false });
    } else if (mode === 'desc') {
      result = sortLines(result, { reverse: true });
    }
    if (doDedupe) {
      result = removeDuplicates(result);
    }
    result = trimLines(result);
    result = removeEmptyLines(result);
    setOutput(result);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setSortMode('none');
    setDedupe(false);
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
        title="String Utilities"
        description="All-in-one text processing toolkit. Convert cases, sort lines, remove duplicates, and inspect text properties."
      />

      <div
        style={{
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #27272a',
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
        <Button size="sm" active={sortMode !== 'none'} onClick={handleSortToggle}>
          {sortMode === 'asc' ? (
            <ArrowUp style={{ width: '14px', height: '14px' }} />
          ) : sortMode === 'desc' ? (
            <ArrowDown style={{ width: '14px', height: '14px' }} />
          ) : (
            <ArrowUpDown style={{ width: '14px', height: '14px' }} />
          )}
          {sortMode === 'asc' ? 'Asc' : sortMode === 'desc' ? 'Desc' : 'Sort'}
        </Button>
        <Button size="sm" active={dedupe} onClick={handleDedupeToggle}>
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Dedupe
        </Button>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a' }} />
        <Button variant="destructive" size="sm" onClick={handleReset}>
          <Undo2 style={{ width: '14px', height: '14px' }} />
          Reset
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
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text here..."
          indicator="Source"
          indicatorColor="green"
        />
        <div
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '12px' }}
        >
          <div style={{ flex: '0 0 50%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
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
            <CaseConverterPane input={output || input} />
          </div>
        </div>
      </div>
    </div>
  );
}
