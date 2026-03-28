import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Undo2,
  Split,
  Rows,
} from 'lucide-react';
import { computeDiffResult } from './diffUtils';

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

function ToolPane({ label, value, onChange, placeholder, indicator, indicatorColor }) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </label>
          {indicator && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: indicatorColor === 'green' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: indicatorColor === 'green' ? '#22c55e' : '#3b82f6',
            }}>
              {indicator}
            </span>
          )}
        </div>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '400px',
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
  );
}

function ToolSplitPane({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      minHeight: '400px',
      flex: '1 1 50%',
    }}>
      {children}
    </div>
  );
}

function DiffModeToggle({ activeMode, onChange }) {
  const modes = [
    { label: 'Lines', value: 'lines' },
    { label: 'Words', value: 'words' },
    { label: 'Chars', value: 'chars' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#1c1917',
      borderRadius: '8px',
      padding: '4px',
      border: '1px solid #27272a',
    }}>
      {modes.map((mode) => {
        const isActive = activeMode === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: isActive ? '#27272a' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? '#f4f4f5' : '#71717a',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#27272a';
                e.currentTarget.style.color = '#a1a1aa';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#71717a';
              }
            }}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function DiffResult({ diff, viewMode }) {
  if (!diff || diff.length === 0) {
    return null;
  }

  // Stats
  let added = 0, removed = 0;
  diff.forEach(part => {
    if (part.added) added += part.count || 0;
    if (part.removed) removed += part.count || 0;
  });

  // Render diff parts - each on its own line for line-based diff
  const renderDiff = () => {
    const lines = [];
    
    diff.forEach((part, index) => {
      const partLines = part.value.split('\n');
      
      partLines.forEach((line, lineIndex) => {
        // Skip empty lines at the end
        if (lineIndex === partLines.length - 1 && line === '') return;
        
        if (part.added) {
          lines.push(
            <div key={`${index}-${lineIndex}`} style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              borderLeft: '3px solid #22c55e',
              padding: '2px 8px 2px 24px',
              margin: '1px 0',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: '8px', opacity: 0.6 }}>+</span>
              {line || '\u00A0'}
            </div>
          );
        } else if (part.removed) {
          lines.push(
            <div key={`${index}-${lineIndex}`} style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              borderLeft: '3px solid #ef4444',
              padding: '2px 8px 2px 24px',
              margin: '1px 0',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: '8px', opacity: 0.6 }}>-</span>
              {line || '\u00A0'}
            </div>
          );
        } else {
          lines.push(
            <div key={`${index}-${lineIndex}`} style={{
              color: '#71717a',
              padding: '2px 8px 2px 24px',
              margin: '1px 0',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: '8px', opacity: 0.4 }}> </span>
              {line || '\u00A0'}
            </div>
          );
        }
      });
    });
    
    return lines;
  };

  return (
    <div style={{
      marginTop: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: '#1c1917',
      border: '1px solid #27272a',
      maxHeight: '250px',
      overflow: 'auto',
    }}>
      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #27272a',
      }}>
        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>+{added} added</span>
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>-{removed} removed</span>
      </div>

      {/* Diff content */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', lineHeight: 1.6 }}>
        {renderDiff()}
      </div>
    </div>
  );
}

export default function TextDiffChecker() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [activeMode, setActiveMode] = useState(
    () => localStorage.getItem('diff-mode') || 'side-by-side'
  );
  const [diffMode, setDiffMode] = useState('lines');

  useEffect(() => {
    localStorage.setItem('diff-mode', activeMode);
  }, [activeMode]);

  const handleReset = () => {
    setOriginal('');
    setModified('');
  };

  // Compute diff
  const diffResult = useMemo(() => {
    if (!original && !modified) return null;
    return computeDiffResult(original, modified, diffMode, false);
  }, [original, modified, diffMode]);

  const diffModes = [
    { id: 'side-by-side', label: 'Side-by-Side', icon: Split },
    { id: 'unified', label: 'Unified View', icon: Rows },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden', backgroundColor: '#09090b' }}>
      <ToolHeader
        title="Text Diff Checker"
        description="Compare two pieces of text and visualize differences instantly. Supports line, word, and character-level diffs."
      />

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <DiffModeToggle activeMode={diffMode} onChange={setDiffMode} />
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1c1917', borderRadius: '8px', padding: '4px', border: '1px solid #27272a' }}>
            {diffModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: activeMode === mode.id ? '#27272a' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: activeMode === mode.id ? '#f4f4f5' : '#71717a',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeMode !== mode.id) {
                      e.currentTarget.style.backgroundColor = '#27272a';
                      e.currentTarget.style.color = '#a1a1aa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMode !== mode.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#71717a';
                    }
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button variant="destructive" size="sm" onClick={handleReset}>
          <Undo2 style={{ width: '14px', height: '14px' }} />
          Reset
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 50%', minHeight: '400px' }}>
        <ToolSplitPane>
          <ToolPane
            label="Original Text"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original version here..."
            indicator="Base Version"
            indicatorColor="green"
          />
          <ToolPane
            label="Modified Text"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified version here..."
            indicator="Comparison Target"
            indicatorColor="blue"
          />
        </ToolSplitPane>
      </div>

      <div style={{ flex: '0 0 auto', minHeight: 0 }}>
        <DiffResult diff={diffResult} viewMode={activeMode} />
      </div>
    </div>
  );
}