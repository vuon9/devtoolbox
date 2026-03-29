import React, { useState, useEffect } from 'react';
import { Binary, Hash, Layout, Columns, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

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

function BaseCard({ label, value, base }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(39, 39, 42, 0.3)',
        border: '1px solid #27272a',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onClick={handleCopy}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#27272a';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(113, 113, 122, 0.6)',
          }}
        >
          {label}
        </span>
        {copied ? (
          <Check style={{ width: '14px', height: '14px', color: '#22c55e' }} />
        ) : (
          <Copy style={{ width: '14px', height: '14px', color: 'rgba(113, 113, 122, 0.4)' }} />
        )}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          color: '#f4f4f5',
          marginTop: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || '0'}
      </div>
    </div>
  );
}

export default function NumberConverter() {
  const [input, setInput] = useState('42');
  const [base, setBase] = useState(10);
  const [results, setResults] = useState({
    bin: '',
    oct: '',
    dec: '',
    hex: '',
    base64: '',
  });

  const convert = (val = input, currentBase = base) => {
    try {
      const num = parseInt(val, currentBase);
      if (isNaN(num)) return;

      setResults({
        bin: num.toString(2),
        oct: num.toString(8),
        dec: num.toString(10),
        hex: num.toString(16).toUpperCase(),
        base64: btoa(num.toString(10)),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    convert();
  }, [input, base]);

  const bases = [
    { id: 'bin', label: 'Binary', value: 2, icon: Binary },
    { id: 'oct', label: 'Octal', value: 8, icon: Hash },
    { id: 'dec', label: 'Decimal', value: 10, icon: Hash },
    { id: 'hex', label: 'Hex', value: 16, icon: Binary },
  ];

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
        title="Number Converter"
        description="Seamlessly convert numbers between binary, octal, decimal, and hexadecimal bases. View bitwise representation and cross-base values instantly."
      />

      <ToolControls>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(39, 39, 42, 0.3)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          {bases.map((b) => {
            const isActive = base === b.value;
            return (
              <button
                key={b.id}
                onClick={() => setBase(b.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive ? '#18181b' : 'transparent',
                  color: isActive ? '#3b82f6' : '#71717a',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <b.icon style={{ width: '14px', height: '14px' }} />
                {b.label}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInput('')}
          style={{ marginLeft: 'auto' }}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
          Clear
        </Button>
      </ToolControls>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <ToolPane
            label={`Input (Base ${base})`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter value..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <BaseCard label="Binary" value={results.bin} base={2} />
            <BaseCard label="Decimal" value={results.dec} base={10} />
            <BaseCard label="Hexadecimal" value={results.hex} base={16} />
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(39, 39, 42, 0.2)',
            border: '1px solid #27272a',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(113, 113, 122, 0.5)',
              borderBottom: '1px solid #27272a',
              paddingBottom: '8px',
              marginBottom: '16px',
            }}
          >
            Bit Representation (Binary 32-bit)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(16, 1fr)',
              gap: '4px',
            }}
          >
            {results.bin
              .padStart(32, '0')
              .split('')
              .map((bit, i) => (
                <div
                  key={i}
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    border: '1px solid',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    backgroundColor:
                      bit === '1' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(24, 24, 27, 0.4)',
                    borderColor: bit === '1' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(39, 39, 42, 0.2)',
                    color: bit === '1' ? '#3b82f6' : 'rgba(113, 113, 122, 0.3)',
                    fontWeight: bit === '1' ? 700 : 400,
                  }}
                >
                  {bit}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
