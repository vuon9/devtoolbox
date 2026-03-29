import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Zap, Filter, Braces, Code2, Code } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import { Format } from '../../generated';

const languages = [
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'xml', label: 'XML', icon: Code2 },
  { id: 'html', label: 'HTML', icon: Code },
  { id: 'css', label: 'CSS', icon: Code },
];

const sampleData = {
  json: '{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"count":2}',
  xml: '<?xml version="1.0"?><catalog><book id="1"><title>Example</title><author>John</author></book></catalog>',
  html: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="header"><h1>Welcome</h1></div></body></html>',
  css: '.container { display: flex; padding: 20px; } .header { background: #333; color: white; }',
};

const filterPlaceholders = {
  json: '.users[].name',
  xml: '//book',
  html: '.header',
  css: '',
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}>
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px', fontSize: '14px' }}>{description}</p>
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
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

function SampleButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#a1a1aa',
        fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      <FileText style={{ width: '14px', height: '14px' }} />
      Load Sample
    </button>
  );
}

function MinifyButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 12px',
        backgroundColor: active ? '#2563eb' : '#27272a',
        border: `1px solid ${active ? '#2563eb' : '#3f3f46'}`,
        borderRadius: '6px',
        color: active ? '#ffffff' : '#a1a1aa',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Zap style={{ width: '14px', height: '14px' }} />
      Minify
    </button>
  );
}

function InputPane({ value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#71717a', fontWeight: 600, letterSpacing: '0.05em' }}>
          Input
        </span>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '12px',
          color: '#f4f4f5',
          fontFamily: "'IBM Plex Mono', 'Menlo', monospace",
          fontSize: '13px',
          lineHeight: 1.5,
          resize: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}

function OutputPane({ content, language, error, filterComponent }) {
  useEffect(() => {
    if (content) {
      Prism.highlightAll();
    }
  }, [content]);

  const getPrismLanguage = (lang) => {
    switch (lang) {
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'html': return 'markup';
      case 'css': return 'css';
      default: return 'text';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#71717a', fontWeight: 600, letterSpacing: '0.05em' }}>
          Formatted Output
        </span>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#18181b',
          border: error ? '1px solid #ef4444' : '1px solid #27272a',
          borderRadius: '8px',
          padding: '12px',
          overflow: 'auto',
          marginBottom: '8px',
        }}
      >
        {content ? (
          <pre style={{ margin: 0, background: 'transparent' }}>
            <code className={`language-${getPrismLanguage(language)}`} style={{ background: 'transparent', padding: 0, fontFamily: "'IBM Plex Mono', 'Menlo', monospace", fontSize: '13px', lineHeight: 1.5 }}>
              {content}
            </code>
          </pre>
        ) : (
          <span style={{ color: '#3f3f46', fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px' }}>
            Result will appear here...
          </span>
        )}
      </div>

      {filterComponent}

      {error && (
        <div
          style={{
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
  );
}

function FilterBar({ value, onChange, placeholder, show }) {
  if (!show) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: '#27272a',
        borderRadius: '6px',
        alignItems: 'center',
        border: '1px solid #3f3f46',
        marginBottom: '8px',
      }}
    >
      <Filter style={{ width: '16px', height: '16px', color: '#a1a1aa', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#f4f4f5',
          padding: '4px 0',
          fontSize: '13px',
          fontFamily: "'IBM Plex Mono', monospace",
          outline: 'none',
        }}
      />
    </div>
  );
}

export default function CodeFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('code-formatter-lang') || 'json');
  const [filter, setFilter] = useState('');
  const [minify, setMinify] = useState(false);
  const [error, setError] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  const debouncedFormat = useCallback(
    debounce(async (content, lang, filterText, minifyMode) => {
      if (!content.trim()) {
        setOutput('');
        setError('');
        return;
      }

      setIsFormatting(true);
      setError('');

      try {
        const result = await Format({
          Input: content,
          FormatType: lang,
          Filter: filterText,
          Minify: minifyMode,
        });

        if (result.error) {
          setError(result.error);
          setOutput('');
        } else {
          setOutput(result.output);
        }
      } catch (err) {
        setError(err.message || 'Formatting failed');
        setOutput('');
      } finally {
        setIsFormatting(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFormat(input, language, filter, minify);
  }, [input, language, filter, minify, debouncedFormat]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('code-formatter-lang', newLang);
    setFilter('');
  };

  const handleLoadSample = () => {
    setInput(sampleData[language]);
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
        description="Clean up and prettify your markup. Supports JSON, XML, HTML, and CSS with intelligent formatting and filtering."
      />

      {/* Top Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Language
          </span>
          <LanguageSelect value={language} onChange={handleLanguageChange} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <SampleButton onClick={handleLoadSample} disabled={isFormatting} />
          <MinifyButton active={minify} onClick={() => setMinify(!minify)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '16px' }}>
        <InputPane
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your ${language.toUpperCase()} here...`}
        />

        <OutputPane
          content={output}
          language={language}
          error={error}
          filterComponent={
            <FilterBar
              value={filter}
              onChange={setFilter}
              placeholder={filterPlaceholders[language]}
              show={language !== 'css'}
            />
          }
        />
      </div>
    </div>
  );
}
