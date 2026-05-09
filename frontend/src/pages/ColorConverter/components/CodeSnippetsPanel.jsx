import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Copy } from 'lucide-react';

const languageTabs = [
  { id: 'css', label: 'CSS' },
  { id: 'swift', label: 'Swift' },
  { id: 'dotnet', label: '.NET' },
  { id: 'java', label: 'Java' },
  { id: 'android', label: 'Android' },
  { id: 'objc', label: 'Obj-C' },
  { id: 'flutter', label: 'Flutter' },
  { id: 'unity', label: 'Unity' },
  { id: 'reactnative', label: 'React Native' },
  { id: 'opengl', label: 'OpenGL' },
  { id: 'svg', label: 'SVG' },
];

export default function CodeSnippetsPanel({ codeSnippets, selectedTab, onTabChange, onCopy }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          flexShrink: 0,
        }}
        role="tablist"
        aria-label="Language tabs"
      >
        {languageTabs.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selectedTab === idx}
            onClick={() => onTabChange(idx)}
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              border: 'none',
              borderBottom: selectedTab === idx ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              color: selectedTab === idx ? 'var(--foreground)' : 'var(--muted-foreground)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem', minWidth: 0 }} role="tabpanel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(codeSnippets[languageTabs[selectedTab]?.id] || []).map((snippet, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--card)',
                borderRadius: '4px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  minWidth: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--muted-foreground)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {snippet.name}
                  </div>

                  <pre
                    style={{
                      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '0.8rem',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: 'var(--foreground)',
                    }}
                  >
                    {snippet.code}
                  </pre>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => onCopy(snippet.code)}
                  style={{ flexShrink: 0, padding: '4px' }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
