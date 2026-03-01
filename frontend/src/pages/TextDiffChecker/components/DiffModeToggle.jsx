import React from 'react';
import { TextAlignLeft, TextAlignCenter, LetterAa } from '@carbon/icons-react';

const modes = [
  { label: 'Lines', icon: TextAlignLeft },
  { label: 'Words', icon: TextAlignCenter },
  { label: 'Chars', icon: LetterAa },
];

export default function DiffModeToggle({ activeMode, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--cds-layer-02)',
        borderRadius: '20px',
        padding: '4px',
        width: 'fit-content',
        minHeight: '40px',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {modes.map((mode, idx) => {
        const isActive = activeMode === idx;
        const Icon = mode.icon;
        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: isActive ? 'var(--cds-layer)' : 'transparent',
              border: 'none',
              borderRadius: '16px',
              color: isActive ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.15)' : 'none',
              minWidth: '100px',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon size={16} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
