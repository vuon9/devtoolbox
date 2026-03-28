import React, { useState, useEffect } from 'react';
import { Download, Copy, AlertTriangle } from 'lucide-react';

export function isBase64Image(str) {
  if (!str || typeof str !== 'string') return false;

  const trimmed = str.trim();

  // Check for data URI format
  if (trimmed.startsWith('data:image/')) {
    return true;
  }

  // Remove common prefixes that might be present
  let cleanStr = trimmed;
  if (cleanStr.startsWith('data:')) {
    // Try to extract base64 part after comma
    const commaIndex = cleanStr.indexOf(',');
    if (commaIndex !== -1) {
      cleanStr = cleanStr.substring(commaIndex + 1);
    }
  }

  // Remove whitespace and newlines
  cleanStr = cleanStr.replace(/\s/g, '');

  // Check minimum length
  if (cleanStr.length < 50) return false;

  // Check if it's valid base64 characters
  const base64Pattern = /^[A-Za-z0-9+/=_-]+$/;
  if (!base64Pattern.test(cleanStr)) return false;

  // Common image signatures in base64
  const imageSignatures = [
    '/9j/', // JPEG
    'iVBORw0KGgo', // PNG
    'R0lGOD', // GIF
    'Qk0', // BMP
    'SUQz', // MP3
    'TVqQ', // EXE (not image, but common)
  ];

  // Also check for data URI with base64
  if (trimmed.includes('data:image') && trimmed.includes('base64')) {
    return true;
  }

  return imageSignatures.some((sig) => cleanStr.startsWith(sig));
}

export function getImageSrc(str) {
  const trimmed = str.trim();

  // If it's already a data URI, return as-is
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Remove whitespace and newlines
  let cleanStr = trimmed.replace(/\s/g, '');

  // Try to detect format
  if (cleanStr.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${cleanStr}`;
  } else if (cleanStr.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${cleanStr}`;
  } else if (cleanStr.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${cleanStr}`;
  } else if (cleanStr.startsWith('Qk0')) {
    return `data:image/bmp;base64,${cleanStr}`;
  }

  // Default to PNG
  return `data:image/png;base64,${cleanStr}`;
}

export function validateBase64(str) {
  try {
    // Remove whitespace and data URI prefix
    let cleanStr = str.trim().replace(/\s/g, '');

    if (cleanStr.startsWith('data:')) {
      const commaIndex = cleanStr.indexOf(',');
      if (commaIndex !== -1) {
        cleanStr = cleanStr.substring(commaIndex + 1);
      }
    }

    // Try to decode
    atob(cleanStr);
    return { valid: true, error: null };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

export default function ImageOutput({ value, onCopy }) {
  const [copyFeedback, setCopyFeedback] = useState('Copy');
  const [loadError, setLoadError] = useState(false);
  const [validation, setValidation] = useState({ valid: true, error: null });

  useEffect(() => {
    if (value) {
      setLoadError(false);
      setValidation(validateBase64(value));
    }
  }, [value]);

  if (!value) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#71717a',
          fontStyle: 'italic',
        }}
      >
        Enter base64 image data...
      </div>
    );
  }

  const imageSrc = getImageSrc(value);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;

    // Determine file extension from data
    let extension = 'png';
    if (value.includes('jpeg') || value.includes('jpg') || value.startsWith('/9j/')) {
      extension = 'jpg';
    } else if (value.includes('gif') || value.startsWith('R0lGOD')) {
      extension = 'gif';
    } else if (value.includes('bmp') || value.startsWith('Qk0')) {
      extension = 'bmp';
    }

    link.download = `image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback('Copy'), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header with actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 0 8px 0',
          borderBottom: '1px solid #27272a',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Image Preview
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              color: '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Copy style={{ width: '14px', height: '14px' }} />
            {copyFeedback}
          </button>
          <button
            onClick={handleDownload}
            disabled={loadError}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: loadError ? 'not-allowed' : 'pointer',
              opacity: loadError ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            Download
          </button>
        </div>
      </div>

      {/* Image display */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          backgroundColor: '#18181b',
          borderRadius: '4px',
          padding: '16px',
        }}
      >
        {!validation.valid ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              textAlign: 'center',
            }}
          >
            <AlertTriangle style={{ width: '32px', height: '32px' }} />
            <div>Invalid Base64 Data</div>
            <div style={{ fontSize: '12px', color: '#71717a' }}>
              {validation.error}
            </div>
          </div>
        ) : loadError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              textAlign: 'center',
            }}
          >
            <AlertTriangle style={{ width: '32px', height: '32px' }} />
            <div>Failed to load image</div>
            <div style={{ fontSize: '12px', color: '#71717a' }}>
              The base64 data may be corrupted or not an image
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#71717a',
                maxWidth: '300px',
                wordBreak: 'break-all',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#27272a',
                borderRadius: '4px',
              }}
            >
              Preview: {value.substring(0, 50)}...
            </div>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt="Base64 decoded"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: loadError ? 'none' : 'block',
            }}
            onError={() => {
              setLoadError(true);
            }}
          />
        )}
      </div>

      {/* Data info */}
      <div
        style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: '#1c1917',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#71717a',
        }}
      >
        Data length: {value.length.toLocaleString()} characters
        {validation.valid && (
          <span style={{ marginLeft: '16px', color: '#22c55e' }}>Valid Base64</span>
        )}
      </div>
    </div>
  );
}