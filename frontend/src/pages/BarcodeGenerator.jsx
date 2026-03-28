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
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'code128', label: 'Code 128', icon: ScanBarcode },
  { id: 'ean13', label: 'EAN-13', icon: Hash },
];

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
  const [type, setType] = useState('qr');
  const [output, setOutput] = useState('');
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
    try {
      const res = await GenerateBarcode({ content: input, standard: type });
      setOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (input) handleGenerate();
  }, [input, type]);

  const handleDownloadSVG = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode.${type}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden', backgroundColor: '#09090b' }}>
      <ToolHeader
        title="Barcode / QR Code"
        description="Generate high-quality QR codes and barcodes for various standards. Customize appearance and download directly as SVG or PNG."
      />

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
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
              <div dangerouslySetInnerHTML={{ __html: output }} style={{ height: '256px', width: '256px' }} />
            ) : (
              <div style={{ height: '256px', width: '256px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#18181b', borderRadius: '8px' }}>
                <QrCode style={{ width: '64px', height: '64px', opacity: 0.1, animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.3, marginTop: '16px' }}>
                  Generating...
                </span>
              </div>
            )}
          </div>

          {output && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <Button size="sm" onClick={handleDownloadSVG}>
                <Download style={{ width: '14px', height: '14px' }} />
                Download SVG
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
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