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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '30px', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
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
      {indicator && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: indicatorColor === 'green' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: indicatorColor === 'green' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
          color: indicatorColor === 'green' ? '#22c55e' : '#3b82f6',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: indicatorColor === 'green' ? '#22c55e' : '#3b82f6',
          }} />
          {indicator}
        </div>
      )}
    </div>
  );
}

function ToolSplitPane({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
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
    return (
      <div style={{
        marginTop: '24px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#1c1917',
        border: '1px solid #27272a',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#71717a',
        fontSize: '14px',
      }}>
        Enter text in both panes to see differences
      </div>
    );
  }

  // Stats
  let added = 0, removed = 0;
  diff.forEach(part => {
    if (part.added) added += part.count || 0;
    if (part.removed) removed += part.count || 0;
  });

  return (
    <div style={{
      marginTop: '24px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#1c1917',
      border: '1px solid #27272a',
      minHeight: '100px',
      maxHeight: '300px',
      overflow: 'auto',
    }}>
      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #27272a',
      }}>
        <span style={{ fontSize: '12px', color: '#22c55e' }}>+{added} added</span>
        <span style={{ fontSize: '12px', color: '#ef4444' }}>-{removed} removed</span>
      </div>

      {/* Diff content */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {diff.map((part, index) => {
          if (part.added) {
            return (
              <div key={index} style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                borderLeft: '3px solid #22c55e',
                padding: '2px 8px',
                margin: '2px 0',
              }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>+</span>
                {part.value}
              </div>
            );
          }
          if (part.removed) {
            return (
              <div key={index} style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                borderLeft: '3px solid #ef4444',
                padding: '2px 8px',
                margin: '2px 0',
                textDecoration: 'line-through',
                opacity: 0.7,
              }}>
                <span style={{ opacity: 0.5, marginRight: '8px' }}>-</span>
                {part.value}
              </div>
            );
          }
          return (
            <span key={index} style={{ color: '#a1a1aa' }}>
              {part.value}
            </span>
          );
        })}
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

      <div style={{ flex: 1, minHeight: 0 }}>
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

      <DiffResult diff={diffResult} viewMode={activeMode} />
    </div>
  );
}