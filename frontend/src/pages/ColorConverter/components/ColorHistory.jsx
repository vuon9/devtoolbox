import React from 'react';
import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';

export default function ColorHistory({ history, onLoadFromHistory, onClearHistory }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--cds-border-subtle)',
        overflow: 'hidden',
        backgroundColor: 'var(--cds-layer)',
        flex: 1,
      }}
    >
      <div
        style={{
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--cds-layer-hover)',
          borderBottom: '1px solid var(--cds-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>History</span>
        <Button
          hasIconOnly
          renderIcon={TrashCan}
          kind="ghost"
          size="sm"
          onClick={onClearHistory}
          iconDescription="Clear history"
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
          maxHeight: '300px',
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '1rem',
              color: 'var(--cds-text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            No colors yet
          </div>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onLoadFromHistory(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '0.25rem',
                backgroundColor: 'var(--cds-layer-hover)',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  backgroundColor: item.hex,
                  border: '1px solid var(--cds-border-strong)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                }}
              >
                {item.hex}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
