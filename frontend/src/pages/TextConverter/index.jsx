import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Plus, Columns } from 'lucide-react';
import ConversionControls from './components/ConversionControls';
import ConfigurationPane from './components/ConfigurationPane';
import MultiHashOutput from './components/MultiHashOutput';
import CommonTags from './components/CommonTags';
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
import { Convert } from '../../generated/wails/conversionService';

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
      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}>
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px' }}>{description}</p>
    </div>
  );
}

function ToolControls({ children, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', ...style }}>
      {children}
    </div>
  );
}

function ToolPane({ label, value, onChange, readOnly, placeholder, onCopy, style = {} }) {
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '50vh', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '30px', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
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

function ToolSplitPane({ children, isVertical = false }) {
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

// Button component with inline styles
function Button({ children, onClick, disabled, variant = 'default', size = 'default', style = {} }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    ...style,
  };

  const variantStyles = {
    default: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      padding: size === 'sm' ? '6px 12px' : '8px 16px',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#a1a1aa',
      border: 'none',
      padding: size === 'sm' ? '6px 12px' : '8px 16px',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#f4f4f5',
      border: '1px solid #27272a',
      padding: size === 'sm' ? '6px 12px' : '8px 16px',
    },
  };

  const sizeStyles = {
    sm: { height: '32px', fontSize: '12px' },
    default: { height: '36px', fontSize: '14px' },
    icon: { width: '32px', height: '32px', padding: '6px' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'ghost' || variant === 'outline') {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
          } else {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'ghost' || variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = variant === 'ghost' ? '#a1a1aa' : '#f4f4f5';
        } else {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }
      }}
    >
      {children}
    </button>
  );
}

// Switch component with inline styles
function Switch({ id, checked, onCheckedChange, disabled = false }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      style={{
        position: 'relative',
        width: '40px',
        height: '22px',
        backgroundColor: checked ? '#2563eb' : '#27272a',
        borderRadius: '11px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        padding: '0',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '18px',
          height: '18px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          transition: 'transform 0.2s ease',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

// Label component with inline styles
function Label({ htmlFor, children, style = {} }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#a1a1aa',
        ...style,
      }}
    >
      {children}
    </label>
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

  const isCurrentInQuickActions = useCallback(() => {
    const isInDefault = DEFAULT_COMMON_TAGS.some(
      (tag) => tag.category === category && tag.method === method
    );
    return isInDefault;
  }, [category, method]);

  const addCurrentToQuickActions = useCallback(() => {
    if (isCurrentInQuickActions()) return;

    const newTag = {
      id: `${category}-${method}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category,
      method,
      label: `${category} - ${method}`,
    };

    // Note: This would need to be implemented with custom tags state
  }, [category, method, isCurrentInQuickActions]);

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

  const handleConvert = () => {
    performConversion(input, category, method, subMode, config);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden' }}>
      <ToolHeader title={TOOL_TITLE} description={TOOL_DESCRIPTION} />

      <CommonTags
        currentCategory={category}
        currentMethod={method}
        onTagSelect={(cat, meth) => {
          setCategory(cat);
          setMethod(meth);
        }}
      />

      {/* First row: Dropdowns + Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
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
          <Button onClick={handleConvert} disabled={config.autoRun} size="sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
            Convert
          </Button>

          <Button variant="ghost" size="sm" disabled={isCurrentInQuickActions()} onClick={addCurrentToQuickActions}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Added
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid #27272a' }}>
            <Switch
              id="auto-run"
              checked={config.autoRun}
              onCheckedChange={(val) => updateConfig({ autoRun: val })}
            />
            <Label htmlFor="auto-run">Auto-run</Label>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setIsVertical(!isVertical)}>
            <Columns style={{ width: '16px', height: '16px', transform: isVertical ? 'rotate(90deg)' : 'none' }} />
          </Button>
        </div>
      </div>

      {/* Second row: Mode toggle (Encode/Decode) */}
      {showModeToggle && (
        <div style={{ marginBottom: '12px' }}>
          <ModeToggle
            mode={subMode}
            modeLabels={modeLabels}
            onChange={setSubMode}
          />
        </div>
      )}

      {showConfig && (
        <div style={{ marginBottom: '16px' }}>
          <ConfigurationPane config={config} updateConfig={updateConfig} method={method} />
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <ToolSplitPane isVertical={isVertical}>
          <ToolPane
            label={LABELS.INPUT(category, subMode, method)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS.INPUT}
          />

          {isAllHashes ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, border: '1px solid #27272a', borderRadius: '8px', backgroundColor: '#18181b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', padding: '12px 12px 0' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a' }}>
                  {LABELS.OUTPUT}
                </label>
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
              style={error ? { border: '1px solid #ef4444' } : {}}
            />
          )}
        </ToolSplitPane>
      </div>
    </div>
  );
}