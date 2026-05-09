import React from 'react';
import { AlignLeft, AlignCenter, CaseSensitive } from 'lucide-react';

const modes = [
  { label: 'Lines', icon: AlignLeft },
  { label: 'Words', icon: AlignCenter },
  { label: 'Chars', icon: CaseSensitive },
];

export default function DiffModeToggle({ activeMode, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--card)',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid var(--border)',
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
              backgroundColor: isActive ? 'var(--muted)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              minWidth: '100px',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--muted)';
                e.currentTarget.style.color = 'var(--muted-foreground)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--muted-foreground)';
              }
            }}
          >
            <Icon style={{ width: '16px', height: '16px' }} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
