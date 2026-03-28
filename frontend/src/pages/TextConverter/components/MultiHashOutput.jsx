import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const HASH_DISPLAY_ORDER = [
  'MD5',
  'SHA-1',
  'SHA-224',
  'SHA-256',
  'SHA-384',
  'SHA-512',
  'SHA-3 (Keccak)',
  'BLAKE2b',
  'BLAKE3',
  'RIPEMD-160',
  'CRC32',
  'Adler-32',
  'MurmurHash3',
  'xxHash',
  'FNV-1a',
];

function CopyBtn({ onCopy, copied }) {
  return (
    <button
      onClick={onCopy}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: '6px',
        backgroundColor: 'transparent',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        color: '#a1a1aa',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
        e.currentTarget.style.color = '#f4f4f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#a1a1aa';
      }}
    >
      {copied ? (
        <Check style={{ width: '16px', height: '16px' }} />
      ) : (
        <Copy style={{ width: '16px', height: '16px' }} />
      )}
    </button>
  );
}

export default function MultiHashOutput({ value, error, onCopy }) {
  const [copiedHash, setCopiedHash] = useState(null);

  if (error) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#ef4444',
          backgroundColor: '#1c1917',
          borderRadius: '8px',
        }}
      >
        {error}
      </div>
    );
  }

  if (!value) {
    return null;
  }

  let hashes;
  try {
    hashes = JSON.parse(value);
  } catch (e) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#ef4444',
          backgroundColor: '#1c1917',
          borderRadius: '8px',
        }}
      >
        Error parsing hash results: {e.message}
      </div>
    );
  }

  const handleCopy = (hashName, hashValue) => {
    navigator.clipboard.writeText(hashValue);
    setCopiedHash(hashName);
    setTimeout(() => setCopiedHash(null), 2000);
    if (onCopy) onCopy(hashName, hashValue);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '12px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {HASH_DISPLAY_ORDER.map((hashName) => {
        const hashValue = hashes[hashName];
        if (!hashValue) return null;

        const isError = hashValue.startsWith('Error:');

        return (
          <div key={hashName}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#f4f4f5',
                }}
              >
                {hashName}
              </span>
              <CopyBtn
                onCopy={() => handleCopy(hashName, hashValue)}
                copied={copiedHash === hashName}
              />
            </div>
            <input
              type="text"
              readOnly
              value={hashValue}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
                fontSize: '12px',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '4px',
                color: isError ? '#ef4444' : '#f4f4f5',
                outline: 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
