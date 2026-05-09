import React, { useState, useEffect, useCallback } from 'react';
import { Columns } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { hashGeneratorAPI } from './api/hashGeneratorAPI';
import MultiHashOutput from './components/MultiHashOutput';

const METHODS = [
  'All',
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
  'bcrypt',
  'scrypt',
  'Argon2',
  'HMAC',
  'CRC32',
  'Adler-32',
  'MurmurHash3',
  'xxHash',
  'FNV-1a',
];

const TOOL_TITLE = 'Hash Generator';
const TOOL_DESCRIPTION = 'Compute cryptographic and non-cryptographic hash digests.';

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

function ToolPane({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  indicator,
  indicatorColor,
  error,
}) {
  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(value);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
                    : 'rgba(59, 130, 246, 0.15)',
                color: indicatorColor === 'green' ? '#22c55e' : '#3b82f6',
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
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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

function ToolSplitPane({ children, isVertical }) {
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

const STORAGE_KEY = 'hash-generator-layout';

export default function HashGenerator() {
  const [method, setMethod] = useState('MD5');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [isVertical, setIsVertical] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'vertical'
  );

  const isAll = method === 'All';
  const isHmac = method === 'HMAC';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isVertical ? 'vertical' : 'horizontal');
  }, [isVertical]);

  const performHash = useCallback(
    async (text, meth) => {
      if (!text && meth !== 'All') {
        setOutput('');
        setError('');
        return;
      }
      if (!text && meth === 'All') {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (meth === 'All') {
          const result = await hashGeneratorAPI.HashAll(text);
          setOutput(JSON.stringify(result, null, 2));
        } else {
          const config = isHmac ? { key: hmacKey } : {};
          const result = await hashGeneratorAPI.Hash(text, meth, config);
          setOutput(result);
        }
        setError('');
      } catch (err) {
        setError(err.message);
        setOutput('');
      }
    },
    [isHmac, hmacKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => performHash(input, method), 300);
    return () => clearTimeout(timer);
  }, [input, method, hmacKey, performHash]);

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            height: '36px',
            padding: '0 12px',
            fontSize: '13px',
            borderRadius: '6px',
            backgroundColor: '#1c1917',
            border: '1px solid #27272a',
            color: '#f4f4f5',
            outline: 'none',
            minWidth: '180px',
          }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {isHmac && (
          <input
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="HMAC Key"
            style={{
              height: '36px',
              padding: '0 12px',
              fontSize: '13px',
              borderRadius: '6px',
              backgroundColor: '#1c1917',
              border: '1px solid #27272a',
              color: '#f4f4f5',
              outline: 'none',
              width: '200px',
            }}
          />
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            onClick={() => setIsVertical(!isVertical)}
            style={{ padding: '4px' }}
          >
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

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr',
            gap: '16px',
            flex: 1,
            minHeight: 0,
          }}
        >
          <ToolPane
            label="Input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            indicator="Source"
            indicatorColor="green"
          />
          {isAll ? (
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
                  Output
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
          ) : (
            <ToolPane
              label="Output"
              value={output}
              readOnly
              placeholder="Hash result will appear here..."
              indicator="Result"
              indicatorColor="blue"
              error={!!error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
