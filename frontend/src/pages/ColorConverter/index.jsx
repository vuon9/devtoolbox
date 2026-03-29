import React, { useState, useEffect } from 'react';
import { Palette, Pipette, Hash, Copy, Check, History, Trash2, Sliders } from 'lucide-react';
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

function ColorInput({ label, value, onChange, icon: Icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '6px',
          marginLeft: '4px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#71717a',
          }}
        />
        <input
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            height: '40px',
            padding: '0 36px 0 36px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            color: '#f4f4f5',
            outline: 'none',
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: copied ? '#22c55e' : '#71717a',
          }}
        >
          {copied ? (
            <Check style={{ width: '14px', height: '14px' }} />
          ) : (
            <Copy style={{ width: '14px', height: '14px' }} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('59, 130, 246');
  const [hsl, setHsl] = useState('217, 91%, 60%');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('color-history')) || [];
    } catch {
      return [];
    }
  });

  const updateAll = (color) => {
    setHex(color);
    setHistory((prev) => {
      const next = [color, ...prev.filter((c) => c !== color)].slice(0, 10);
      localStorage.setItem('color-history', JSON.stringify(next));
      return next;
    });
  };

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      updateAll(val);
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
        title="Color Converter"
        description="Convert colors between Hex, RGB, HSL, and more. Visualize palettes and maintain a history of your favorite shades."
      />

      <ToolControls>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(39, 39, 42, 0.3)',
            padding: '4px 16px 4px 4px',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <div
            style={{
              height: '36px',
              width: '48px',
              borderRadius: '6px',
              border: '1px solid #27272a',
              backgroundColor: hex,
            }}
          />
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              fontSize: '18px',
              color: '#3b82f6',
            }}
          >
            {hex.toUpperCase()}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
          <Trash2 style={{ width: '14px', height: '14px' }} />
          Clear History
        </Button>
      </ToolControls>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: 'rgba(39, 39, 42, 0.2)',
              border: '1px solid #27272a',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              <Sliders style={{ width: '12px', height: '12px' }} />
              Color Values
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ColorInput label="Hexadecimal" value={hex} onChange={handleHexChange} icon={Hash} />
              <ColorInput
                label="RGB (Red, Green, Blue)"
                value={rgb}
                onChange={setRgb}
                icon={Pipette}
              />
              <ColorInput
                label="HSL (Hue, Saturation, Light)"
                value={hsl}
                onChange={setHsl}
                icon={Pipette}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'rgba(113, 113, 122, 0.5)',
                borderBottom: '1px solid #27272a',
                paddingBottom: '8px',
                marginBottom: '16px',
                paddingLeft: '4px',
              }}
            >
              <History style={{ width: '12px', height: '12px' }} />
              Recent Colors
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {history.map((color, i) => (
                <button
                  key={i}
                  style={{
                    height: '48px',
                    borderRadius: '6px',
                    border: '1px solid #27272a',
                    backgroundColor: color,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={() => updateAll(color)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(9, 9, 11, 0.5)',
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: '#f4f4f5',
                      textTransform: 'uppercase',
                    }}
                  >
                    {color}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '24px',
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
            Generated Palette
          </div>
          <div
            style={{
              display: 'flex',
              height: '96px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #27272a',
            }}
          >
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => (
              <div
                key={p}
                style={{
                  flex: 1,
                  backgroundColor: hex,
                  opacity: p / 100,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.flex = '1.5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.flex = '1';
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
