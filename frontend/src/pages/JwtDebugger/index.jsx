import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Key,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Binary,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { Decode, Encode, Verify } from '../../services/jwtService';

// Sample data for testing
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const SAMPLE_HEADER = '{"alg": "HS256", "typ": "JWT"}';
const SAMPLE_PAYLOAD = '{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}';
const SAMPLE_SECRET = 'your-256-bit-secret';

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

function ToolTextArea({ label, value, onChange, placeholder, readOnly, style = {} }) {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...style }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
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
        <button
          onClick={handleCopy}
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
          minHeight: '150px',
          padding: '12px',
          fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
          fontSize: '13px',
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

function ToolSplitPane({ children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1c1917',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid #27272a',
      }}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
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
            {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusMessage({ type, children }) {
  const styles = {
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function SecretInput({ label, value, onChange, placeholder }) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type={showSecret ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            color: '#f4f4f5',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => setShowSecret(!showSecret)}
          style={{
            padding: '8px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            color: '#71717a',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f4f4f5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
        >
          {showSecret ? (
            <EyeOff style={{ width: '16px', height: '16px' }} />
          ) : (
            <Eye style={{ width: '16px', height: '16px' }} />
          )}
        </button>
      </div>
    </div>
  );
}

function SelectDropdown({ label, value, onChange, options, width = '140px' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
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
      )}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: width,
            height: '32px',
            padding: '0 12px',
            backgroundColor: isOpen ? '#27272a' : '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            color: '#f4f4f5',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.borderColor = '#52525b';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = '#18181b';
              e.currentTarget.style.borderColor = '#3f3f46';
            }
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption?.label || value}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              marginLeft: '8px',
              opacity: 0.7,
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#1c1917',
              border: '1px solid #27272a',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              zIndex: 50,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: value === opt.value ? '#f4f4f5' : '#a1a1aa',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#27272a';
                  e.currentTarget.style.color = '#f4f4f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = value === opt.value ? '#f4f4f5' : '#a1a1aa';
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JwtDebugger() {
  const [jwt, setJwt] = useState('');
  const [payload, setPayload] = useState('');
  const [header, setHeader] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [activeMode, setActiveMode] = useState('decode');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');
  const [verifySecret, setVerifySecret] = useState('');
  const [verifyEncoding, setVerifyEncoding] = useState('raw');

  const fillSample = () => {
    if (activeMode === 'decode') {
      setJwt(SAMPLE_JWT);
      setVerifySecret(SAMPLE_SECRET);
      setVerifyEncoding('raw');
    } else {
      setHeader(SAMPLE_HEADER);
      setPayload(SAMPLE_PAYLOAD);
      setSecret(SAMPLE_SECRET);
    }
  };

  const handleDecode = async (token = jwt) => {
    if (!token.trim()) return;
    try {
      // If secret is provided, verify the signature
      if (verifySecret.trim()) {
        const res = await Verify(token, verifySecret, verifyEncoding);
        setPayload(JSON.stringify(res.payload, null, 2));
        setHeader(JSON.stringify(res.header, null, 2));
        setIsValid(res.valid);
        setError('');
      } else {
        // Just decode without verification
        const res = await Decode(token);
        setPayload(JSON.stringify(res.payload, null, 2));
        setHeader(JSON.stringify(res.header, null, 2));
        setIsValid(null); // Can't verify without secret
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Invalid JWT format.');
      setPayload('');
      setHeader('');
      setIsValid(false);
    }
  };

  const handleEncode = async () => {
    try {
      const res = await Encode(header, payload, algorithm, secret || 'your-256-bit-secret');
      setJwt(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Encoding failed. Check JSON format.');
    }
  };

  useEffect(() => {
    if (jwt && activeMode === 'decode') handleDecode(jwt);
  }, [jwt, activeMode, verifySecret, verifyEncoding]);

  const modes = [
    { id: 'decode', label: 'Decode', icon: Hash },
    { id: 'encode', label: 'Encode', icon: Binary },
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
        title="JWT Debugger"
        description="Inspect, decode, and encode JSON Web Tokens. Verify signatures and visualize payload contents with ease."
      />

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272a',
          paddingBottom: '16px',
        }}
      >
        <ToggleGroup options={modes} value={activeMode} onChange={setActiveMode} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" onClick={fillSample}>
            <FileText style={{ width: '14px', height: '14px' }} />
            Sample
          </Button>
          {activeMode === 'encode' && (
            <Button onClick={handleEncode}>
              <Lock style={{ width: '14px', height: '14px' }} />
              Sign & Encode
            </Button>
          )}
        </div>
      </div>

      {activeMode === 'decode' ? (
        <ToolSplitPane>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ToolTextArea
              label="Encoded Token"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              placeholder="Paste encoded JWT here..."
            />

            <div
              style={{
                padding: '16px',
                backgroundColor: '#1c1917',
                border: '1px solid #27272a',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <Key style={{ width: '14px', height: '14px', color: '#71717a' }} />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#f4f4f5',
                  }}
                >
                  Signature Verification (Optional)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <SelectDropdown
                  label="Encoding"
                  value={verifyEncoding}
                  onChange={setVerifyEncoding}
                  options={[
                    { value: 'base64', label: 'Base64' },
                    { value: 'hex', label: 'Hex' },
                    { value: 'raw', label: 'Raw' },
                  ]}
                  width="120px"
                />
              </div>
              <SecretInput
                label="Secret"
                value={verifySecret}
                onChange={(e) => setVerifySecret(e.target.value)}
                placeholder="Enter secret to verify signature..."
              />
            </div>

            {isValid !== null && (
              <StatusMessage type={isValid ? 'success' : 'error'}>
                {isValid ? (
                  <>
                    <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                    Signature Verified
                  </>
                ) : (
                  <>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    Invalid Signature / Format
                  </>
                )}
              </StatusMessage>
            )}
            {error && !isValid && <StatusMessage type="error">{error}</StatusMessage>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ToolTextArea
              label="Header (Algorithm & Type)"
              value={header}
              readOnly
              placeholder="{ 'alg': 'HS256', 'typ': 'JWT' }"
            />
            <ToolTextArea
              label="Payload (Data)"
              value={payload}
              readOnly
              placeholder="{ 'sub': '1234567890', 'name': 'John Doe' }"
            />
          </div>
        </ToolSplitPane>
      ) : (
        <ToolSplitPane>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ToolTextArea
              label="Header (JSON)"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              placeholder='{"alg": "HS256", "typ": "JWT"}'
            />
            <ToolTextArea
              label="Payload (JSON)"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='{"sub": "1234567890", "name": "John Doe"}'
            />

            <div
              style={{
                padding: '16px',
                backgroundColor: '#1c1917',
                border: '1px solid #27272a',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <Key style={{ width: '14px', height: '14px', color: '#71717a' }} />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#f4f4f5',
                  }}
                >
                  Signing Configuration
                </span>
              </div>
              <SelectDropdown
                label="Algorithm"
                value={algorithm}
                onChange={setAlgorithm}
                options={[
                  { value: 'HS256', label: 'HS256' },
                  { value: 'HS384', label: 'HS384' },
                  { value: 'HS512', label: 'HS512' },
                  { value: 'RS256', label: 'RS256' },
                ]}
                width="120px"
              />
              <div style={{ marginTop: '12px' }}>
                <SecretInput
                  label="Secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret for signing..."
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ToolTextArea
              label="Encoded Token"
              value={jwt}
              readOnly
              placeholder="Encoded JWT will appear here..."
            />
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        </ToolSplitPane>
      )}
    </div>
  );
}
