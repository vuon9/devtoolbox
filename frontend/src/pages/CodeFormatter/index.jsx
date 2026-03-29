import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, Braces, Code2, Code, Brackets } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Format } from '../../generated/wails/codeFormatterService';

const languages = [
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'html', label: 'HTML', icon: Code2 },
  { id: 'css', label: 'CSS', icon: Code },
  { id: 'xml', label: 'XML', icon: Code2 },
  { id: 'sql', label: 'SQL', icon: Brackets },
  { id: 'javascript', label: 'JavaScript', icon: Code },
  { id: 'java', label: 'Java', icon: Code },
];

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

function ToolControls({ children, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ToolPane({ label, value, onChange, readOnly, placeholder, error, style = {} }) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...style }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
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
          border: error ? '1px solid #ef4444' : '1px solid #27272a',
          borderRadius: '8px',
          color: '#f4f4f5',
          resize: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}

function LanguageSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLang = languages.find((l) => l.id === value) || languages[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '36px',
          padding: '0 12px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '6px',
          color: '#f4f4f5',
          fontSize: '14px',
          cursor: 'pointer',
          minWidth: '140px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <selectedLang.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          <span>{selectedLang.label}</span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ opacity: 0.5 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                onChange(lang.id);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: value === lang.id ? '#27272a' : 'transparent',
                border: 'none',
                color: '#f4f4f5',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (value !== lang.id) {
                  e.currentTarget.style.backgroundColor = '#27272a';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== lang.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <lang.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CodeFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(
    () => localStorage.getItem('code-formatter-lang') || 'json'
  );
  const [error, setError] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    localStorage.setItem('code-formatter-lang', language);
  }, [language]);

  const handleFormat = async () => {
    if (!input.trim()) return;
    setIsFormatting(true);
    setError('');
    try {
      const result = await Format({ content: input, language: language });
      setOutput(result);
    } catch (err) {
      setError(err.message || 'Formatting failed. Please check your code syntax.');
      console.error(err);
    } finally {
      setIsFormatting(false);
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
        title="Code Formatter"
        description="Clean up and prettify your source code. Supports multiple languages with intelligent indentation and formatting rules."
      />

      <ToolControls>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Language
          </label>
          <LanguageSelect value={language} onChange={setLanguage} />
        </div>

        <Button onClick={handleFormat} disabled={isFormatting || !input.trim()}>
          <Play
            style={{
              width: '14px',
              height: '14px',
              fill: 'currentColor',
              animation: isFormatting ? 'pulse 1s infinite' : 'none',
            }}
          />
          {isFormatting ? 'Formatting...' : 'Format Code'}
        </Button>
      </ToolControls>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '16px' }}>
        <ToolPane
          label="Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your raw ${language.toUpperCase()} here...`}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <ToolPane
            label="Formatted Output"
            value={output}
            readOnly
            placeholder="Result will appear here..."
            error={!!error}
          />
          {error && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '12px',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
