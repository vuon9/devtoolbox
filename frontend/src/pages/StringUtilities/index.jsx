import React, { useState, useEffect } from 'react';
import {
  Type,
  Hash,
  ListOrdered,
  AlignLeft,
  Trash2,
  Undo2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import CaseConverterPane from './components/CaseConverterPane';
import SortDedupePane from './components/SortDedupePane';
import InspectorPane from './components/InspectorPane';
import ModeTabBar from './components/ModeTabBar';
import {
  convertCase,
  sortLines,
  removeDuplicates,
  getTextStats,
  trimLines,
  removeEmptyLines,
} from './strings';

// Inline-styled components
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

function ToolPane({ label, value, onChange, readOnly, placeholder, style = {} }) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '30px', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
        {!readOnly && (
          <button
            onClick={handleCopy}
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
              color: '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#f4f4f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        )}
      </div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <textarea
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            padding: '12px',
            fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
            fontSize: '14px',
            lineHeight: 1.5,
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#f4f4f5',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

function ToolSplitPane({ children, columnCount = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columnCount === 1 ? '1fr' : '1fr 1fr',
      gap: '16px',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#f4f4f5' }}>
        {value}
      </div>
    </div>
  );
}

export default function StringUtilities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeMode, setActiveMode] = useState(
    () => localStorage.getItem('string-utils-mode') || 'case'
  );

  useEffect(() => {
    localStorage.setItem('string-utils-mode', activeMode);
  }, [activeMode]);

  const handleCaseChange = (type) => {
    setOutput(convertCase(input, type));
  };

  const handleSort = (options) => {
    setOutput(sortLines(input, options));
  };

  const handleDedupe = () => {
    setOutput(removeDuplicates(input));
  };

  const handleTrim = () => {
    setOutput(trimLines(input));
  };

  const handleRemoveEmpty = () => {
    setOutput(removeEmptyLines(input));
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const stats = getTextStats(activeMode === 'inspector' ? input : output || input);

  const modes = [
    { id: 'case', label: 'Case Converter', icon: Type },
    { id: 'sort', label: 'Sort & Dedupe', icon: ListOrdered },
    { id: 'inspector', label: 'Text Inspector', icon: Hash },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden', backgroundColor: '#09090b' }}>
      <ToolHeader
        title="String Utilities"
        description="All-in-one text processing toolkit. Convert between cases, sort lines, remove duplicates, and inspect text properties."
      />

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
        <ModeTabBar modes={modes} activeMode={activeMode} onModeChange={setActiveMode} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={handleTrim}>
            <AlignLeft style={{ width: '14px', height: '14px' }} />
            Trim Lines
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRemoveEmpty}>
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear Empty
          </Button>
          <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a', margin: '0 8px' }} />
          <Button variant="destructive" size="sm" onClick={handleReset}>
            <Undo2 style={{ width: '14px', height: '14px' }} />
            Reset
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {activeMode === 'inspector' ? (
          <InspectorPane input={input} setInput={setInput} stats={stats} />
        ) : (
          <ToolSplitPane>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <ToolPane
                label="Input Text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type text here..."
              />
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#1c1917', border: '1px solid #27272a' }}>
                {activeMode === 'case' ? (
                  <CaseConverterPane input={input} />
                ) : (
                  <SortDedupePane onSort={handleSort} onDedupe={handleDedupe} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <ToolPane
                label="Result"
                value={output}
                readOnly
                placeholder="Transformed text will appear here..."
              />
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#1c1917', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <StatItem label="Lines" value={stats.lines} />
                <StatItem label="Words" value={stats.words} />
                <StatItem label="Chars" value={stats.chars} />
              </div>
            </div>
          </ToolSplitPane>
        )}
      </div>
    </div>
  );
}