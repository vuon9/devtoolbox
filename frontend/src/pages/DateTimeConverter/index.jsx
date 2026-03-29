import React, { useState, useEffect } from 'react';
import { Play, Copy, Clock, Calendar, Globe, History, Layout, Columns } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Convert } from '../../generated/wails/dateTimeService';

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
        gap: '16px',
        marginBottom: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ToolPane({ label, value, onChange, placeholder, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...style }}>
      <div style={{ marginBottom: '8px' }}>
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
      </div>
      <textarea
        value={value}
        onChange={onChange}
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

function ResultGroup({ icon: Icon, label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'rgba(113, 113, 122, 0.6)',
          borderBottom: '1px solid #27272a',
          paddingBottom: '4px',
          marginBottom: '8px',
          paddingLeft: '4px',
        }}
      >
        <Icon style={{ width: '12px', height: '12px' }} />
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      onClick={handleCopy}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <code
          style={{
            fontSize: '13px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#3b82f6',
            fontWeight: 500,
          }}
        >
          {value}
        </code>
        <Copy
          style={{
            width: '12px',
            height: '12px',
            color: copied ? '#22c55e' : 'transparent',
          }}
        />
      </div>
    </div>
  );
}

export default function DateTimeConverter() {
  const [input, setInput] = useState(() => Date.now().toString());
  const [results, setResults] = useState(null);
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('datetime-layout') === 'vertical'
  );

  useEffect(() => {
    localStorage.setItem('datetime-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleConvert = async (val = input) => {
    try {
      const res = await Convert({ value: val });
      setResults(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleConvert();
  }, []);

  const handleQuickPreset = (preset) => {
    let newVal = '';
    const now = new Date();

    if (preset === 'now') newVal = Date.now().toString();
    else if (preset === 'today') {
      now.setHours(0, 0, 0, 0);
      newVal = now.toISOString();
    } else if (preset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(0, 0, 0, 0);
      newVal = now.toISOString();
    }

    setInput(newVal);
    handleConvert(newVal);
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
        title="DateTime Converter"
        description="Convert between Unix timestamps, ISO 8601, and various human-readable formats. Easily navigate time across timezones."
      />

      <ToolControls style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button size="sm" onClick={() => handleQuickPreset('now')}>
            Now
          </Button>
          <Button size="sm" onClick={() => handleQuickPreset('today')}>
            Today 00:00
          </Button>
          <Button size="sm" onClick={() => handleQuickPreset('tomorrow')}>
            Tomorrow 00:00
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setIsVertical(!isVertical)}>
          <Columns
            style={{
              width: '16px',
              height: '16px',
              transform: isVertical ? 'rotate(90deg)' : 'none',
            }}
          />
        </Button>
      </ToolControls>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '16px' }}>
        <ToolPane
          label="Input (Timestamp or ISO String)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleConvert(e.target.value);
          }}
          placeholder="1711123456 or 2024-03-23T12:00:00Z"
          style={{ flex: isVertical ? '0 0 40%' : 1 }}
        />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid #27272a',
            borderRadius: '8px',
            backgroundColor: 'rgba(24, 24, 27, 0.05)',
            padding: '16px',
          }}
        >
          {results ? (
            <>
              <ResultGroup icon={Clock} label="Unix Timestamps">
                <ResultRow label="Seconds" value={results.unix_seconds} />
                <ResultRow label="Milliseconds" value={results.unix_milliseconds} />
                <ResultRow label="Microseconds" value={results.unix_microseconds} />
              </ResultGroup>

              <ResultGroup icon={Globe} label="ISO 8601 / UTC">
                <ResultRow label="UTC Date" value={results.utc_iso} />
                <ResultRow label="UTC RFC3339" value={results.utc_rfc3339} />
              </ResultGroup>

              <ResultGroup icon={Calendar} label="Local Time">
                <ResultRow label="Local Date" value={results.local_readable} />
                <ResultRow label="Relative" value={results.relative_time} />
              </ResultGroup>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#71717a',
                fontStyle: 'italic',
                fontSize: '14px',
              }}
            >
              Enter a valid date or timestamp...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
