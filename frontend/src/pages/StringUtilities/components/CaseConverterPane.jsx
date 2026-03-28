import React from 'react';
import { Copy } from 'lucide-react';

const cases = [
  { id: 'camel', label: 'camelCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'constant', label: 'CONSTANT_CASE' },
  { id: 'upper', label: 'UPPER CASE' },
  { id: 'lower', label: 'lower case' },
];

const splitWords = (str) => {
  if (!str) return [];
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .split(/\s+/)
    .filter((x) => x);
};

const convertCase = (input, type) => {
  if (!input) return '';

  const words = splitWords(input);
  if (words.length === 0) return '';

  switch (type) {
    case 'camel':
      return words
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'pascal':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    default:
      return input;
  }
};

function CaseResult({ label, value }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#1c1917',
        borderRadius: '6px',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: '#71717a',
          minWidth: '100px',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
          fontSize: '14px',
          color: '#f4f4f5',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || '<empty>'}
      </div>
      <button
        onClick={handleCopy}
        disabled={!value}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          padding: '6px',
          backgroundColor: copied ? '#2563eb' : 'transparent',
          border: 'none',
          borderRadius: '4px',
          color: value ? (copied ? '#ffffff' : '#71717a') : '#3f3f46',
          cursor: value ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (value && !copied) {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = value ? '#71717a' : '#3f3f46';
          }
        }}
      >
        <Copy style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}

export default function CaseConverterPane({ input }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {cases.map((caseItem) => (
        <CaseResult
          key={caseItem.id}
          label={caseItem.label}
          value={convertCase(input, caseItem.id)}
        />
      ))}
    </div>
  );
}
