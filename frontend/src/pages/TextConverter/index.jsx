import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Columns } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import ConversionControls from './components/ConversionControls';
import ConfigurationPane from './components/ConfigurationPane';
import MultiHashOutput from './components/MultiHashOutput';
import ImageOutput, { isBase64Image } from './components/ImageOutput';
import { CONVERTER_MAP } from './constants';
import {
  TOOL_TITLE,
  TOOL_DESCRIPTION,
  STORAGE_KEYS,
  DEFAULTS,
  DEFAULT_COMMON_TAGS,
  LABELS,
  PLACEHOLDERS,
} from './strings';
import { Convert } from '../../services/conversionService';

// Mode toggle component for Encode/Decode, Encrypt/Decrypt, etc.
function ModeToggle({ mode, modeLabels, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#1c1917',
          border: '1px solid #27272a',
          padding: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => onChange(modeLabels.left)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: mode === modeLabels.left ? '#27272a' : 'transparent',
            color: mode === modeLabels.left ? '#f4f4f5' : '#71717a',
            boxShadow: mode === modeLabels.left ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          {modeLabels.left}
        </button>
        <button
          type="button"
          onClick={() => onChange(modeLabels.right)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: mode === modeLabels.right ? '#27272a' : 'transparent',
            color: mode === modeLabels.right ? '#f4f4f5' : '#71717a',
            boxShadow: mode === modeLabels.right ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          {modeLabels.right}
        </button>
      </div>
    </div>
  );
}

// Inline-styled components
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
      style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', ...style }}
    >
      {children}
    </div>
  );
}

function ToolPane({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  onCopy,
  indicator,
  indicatorColor,
  error,
  style = {},
}) {
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (value) {
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
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
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

function ToolSplitPane({ children, isVertical = false }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr',
        gap: '16px',
        flex: 1,
        minHeight: 0,
      }}
    >
      {children}
    </div>
  );
}

export default function TextBasedConverter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get preset from URL params
  const urlCategory = searchParams.get('category');
  const urlMethod = searchParams.get('method');

  // Validate and use URL params or fall back to localStorage defaults
  const validCategories = Object.keys(CONVERTER_MAP);
  const initialCategory = validCategories.includes(urlCategory)
    ? urlCategory
    : localStorage.getItem(STORAGE_KEYS.CATEGORY) || DEFAULTS.CATEGORY;

  const validMethods = CONVERTER_MAP[initialCategory] || [];
  const initialMethod = validMethods.includes(urlMethod)
    ? urlMethod
    : localStorage.getItem(STORAGE_KEYS.METHOD) || DEFAULTS.METHOD;

  // Persistent state initialization
  const [category, setCategory] = useState(initialCategory);
  const [method, setMethod] = useState(initialMethod);
  const [subMode, setSubMode] = useState(
    () => localStorage.getItem(STORAGE_KEYS.SUBMODE) || DEFAULTS.SUBMODE
  );

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('text-converter-layout') === 'vertical'
  );

  // Config state
  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || DEFAULTS.CONFIG;
    } catch {
      return DEFAULTS.CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('text-converter-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  // Submode default logic
  useEffect(() => {
    if (category === 'Encrypt - Decrypt' && !['Encrypt', 'Decrypt'].includes(subMode)) {
      setSubMode('Encrypt');
    } else if (category === 'Encode - Decode' && !['Encode', 'Decode'].includes(subMode)) {
      setSubMode('Encode');
    } else if (category === 'Escape' && !['Escape', 'Unescape'].includes(subMode)) {
      setSubMode('Escape');
    } else if (category === 'Hash' || category === 'Convert') {
      setSubMode('');
    }
  }, [category]);

  // Persistence effects
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CATEGORY, category), [category]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.METHOD, method), [method]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SUBMODE, subMode), [subMode]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)), [config]);

  const performConversion = useCallback(async (text, cat, meth, sub, cfg) => {
    if (!text && cat !== 'Hash') {
      setOutput('');
      setError('');
      return;
    }

    if (!text && cat === 'Hash' && meth === 'All') {
      setOutput('');
      setError('');
      return;
    }

    if (text && text.trim().startsWith('data:image/')) {
      setOutput(text.trim());
      setError('');
      return;
    }

    try {
      const backendConfig = { ...cfg, subMode: sub };
      const result = await Convert(text, cat, meth, backendConfig);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('error') || err.message.includes('invalid')) {
        setOutput('');
      }
    }
  }, []);

  useEffect(() => {
    if (config.autoRun) {
      performConversion(input, category, method, subMode, config);
    }
  }, [input, category, method, subMode, config.autoRun, performConversion]);

  const updateConfig = (newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }));

  const showConfig = category === 'Encrypt - Decrypt' || method === 'HMAC';
  const isAllHashes = category === 'Hash' && method === 'All';
  const isImageOutput = !isAllHashes && isBase64Image(output);

  const showModeToggle = ['Encrypt - Decrypt', 'Encode - Decode', 'Escape'].includes(category);
  const modeLabels =
    category === 'Encrypt - Decrypt'
      ? { left: 'Encrypt', right: 'Decrypt' }
      : category === 'Escape'
        ? { left: 'Escape', right: 'Unescape' }
        : { left: 'Encode', right: 'Decode' };

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

      {/* First row: Dropdowns + Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <ConversionControls
          category={category}
          setCategory={(c) => {
            setCategory(c);
            setMethod(CONVERTER_MAP[c][0]);
          }}
          method={method}
          setMethod={setMethod}
          showModeToggle={false}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Quick Presets:
          </span>
          {DEFAULT_COMMON_TAGS.map((tag) => {
            const isActive = tag.category === category && tag.method === method;
            return (
              <Button
                key={tag.id}
                size="sm"
                active={isActive}
                onClick={() => {
                  setCategory(tag.category);
                  setMethod(tag.method);
                }}
              >
                {tag.label}
              </Button>
            );
          })}
          <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a' }} />
          <Button variant="ghost" size="icon" onClick={() => setIsVertical(!isVertical)}>
            <Columns
              style={{
                width: '16px',
                height: '16px',
                transform: isVertical ? 'rotate(90deg)' : 'none',
              }}
            />
          </Button>
        </div>
      </div>

      {/* Second row: Mode toggle (Encode/Decode) */}
      {showModeToggle && (
        <div style={{ marginBottom: '16px' }}>
          <ModeToggle mode={subMode} modeLabels={modeLabels} onChange={setSubMode} />
        </div>
      )}

      {showConfig && (
        <div style={{ marginBottom: '16px' }}>
          <ConfigurationPane config={config} updateConfig={updateConfig} method={method} />
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <ToolSplitPane isVertical={isVertical}>
          <ToolPane
            label={LABELS.INPUT(category, subMode, method)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS.INPUT}
            indicator="Source"
            indicatorColor="green"
          />

          {isAllHashes ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                border: '1px solid #27272a',
                borderRadius: '8px',
                backgroundColor: '#18181b',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid #27272a',
                  backgroundColor: '#09090b',
                }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                  }}
                >
                  {LABELS.OUTPUT}
                </label>
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
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                  }}
                >
                  All Hashes
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                <MultiHashOutput value={output} error={error} />
              </div>
            </div>
          ) : isImageOutput ? (
            <ImageOutput value={output} />
          ) : (
            <ToolPane
              label={LABELS.OUTPUT}
              value={output}
              readOnly
              placeholder={PLACEHOLDERS.OUTPUT}
              indicator="Result"
              indicatorColor="blue"
              error={!!error}
            />
          )}
        </ToolSplitPane>
      </div>
    </div>
  );
}
