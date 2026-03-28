import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import {
  ScanBarcode,
  Download,
  QrCode,
  Hash,
  Columns,
  Trash2,
} from 'lucide-react';
import { GenerateBarcode } from '../services/barcodeService';

const types = [
  { id: 'QR', label: 'QR Code', icon: QrCode },
  { id: 'Code128', label: 'Code 128', icon: ScanBarcode },
  { id: 'Code39', label: 'Code 39', icon: ScanBarcode },
  { id: 'EAN-13', label: 'EAN-13', icon: Hash },
  { id: 'EAN-8', label: 'EAN-8', icon: Hash },
];

// Size for barcode generation
const BARCODE_SIZE = 512;

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

function ToolTextArea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '200px',
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

function ToolSplitPane({ children, isVertical }) {
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

function TypeToggle({ types, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#1c1917',
      borderRadius: '8px',
      padding: '4px',
      border: '1px solid #27272a',
      flexWrap: 'wrap',
    }}>
      {types.map((t) => {
        const Icon = t.icon;
        const isActive = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
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
            <Icon style={{ width: '16px', height: '16px' }} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function BarcodeGenerator() {
  const [input, setInput] = useState('https://github.com/wailsapp/wails');
  const [type, setType] = useState('QR');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem('barcode-layout') === 'vertical'
  );

  useEffect(() => {
    localStorage.setItem('barcode-layout', isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const handleGenerate = async () => {
    if (!input) return;
    setIsGenerating(true);
    setError('');
    try {
      // For 1D barcodes, we need a larger size to meet the minimum requirement
      const size = type === 'QR' ? BARCODE_SIZE : 512;
      const res = await GenerateBarcode({ 
        content: input, 
        standard: type, 
        size: size 
      });
      if (res.error) {
        setError(res.error);
        setOutput('');
      } else if (res.dataUrl) {
        setOutput(res.dataUrl);
        setError('');
      } else {
        setError('Unexpected response format');
        setOutput('');
      }
    } catch (err) {
      console.error('Barcode error:', err);
      setError(err.message || 'Failed to generate barcode');
      setOutput('');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (input) handleGenerate();
  }, [input, type]);

  const handleDownloadPNG = () => {
    if (!output) return;
    const a = document.createElement('a');
    a.href = output;
    a.download = `barcode.${type.toLowerCase()}.png`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden', backgroundColor: '#09090b' }}>
      <ToolHeader
        title="Barcode / QR Code"
        description="Generate high-quality QR codes and barcodes for various standards. Customize appearance and download directly as PNG."
      />

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <TypeToggle types={types} value={type} onChange={setType} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={() => setInput('')}>
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear
          </Button>
          <div style={{ width: '1px', height: '16px', backgroundColor: '#27272a', margin: '0 8px' }} />
          <Button variant="ghost" size="sm" onClick={() => setIsVertical(!isVertical)}>
            <Columns style={{ width: '14px', height: '14px', transform: isVertical ? 'rotate(90deg)' : 'none' }} />
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <ToolSplitPane isVertical={isVertical}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ToolTextArea
            label="Input Content"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or URL to encode..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', border: '1px solid #27272a', borderRadius: '8px', backgroundColor: '#18181b', padding: '48px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#52525b' }}>
            Preview
          </div>

          <div style={{ backgroundColor: '#09090b', padding: '32px', borderRadius: '12px', border: '4px solid rgba(59, 130, 246, 0.2)' }}>
            {output ? (
              <img src={output} alt="Barcode" style={{ height: 'auto', width: '100%', maxWidth: '400px', objectFit: 'contain', imageRendering: type === 'QR' ? 'auto' : 'pixelated' }} />
            ) : (
              <div style={{ height: '256px', width: '256px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#18181b', borderRadius: '8px' }}>
                <QrCode style={{ width: '64px', height: '64px', opacity: 0.2 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3, marginTop: '16px' }}>
                  {isGenerating ? 'Generating...' : 'Enter content'}
                </span>
              </div>
            )}
          </div>

          {output && (
            <div style={{ marginTop: '24px' }}>
              <Button onClick={handleDownloadPNG}>
                <Download style={{ width: '14px', height: '14px' }} />
                Download PNG
              </Button>
            </div>
          )}
        </div>
      </ToolSplitPane>
    </div>
  );
}