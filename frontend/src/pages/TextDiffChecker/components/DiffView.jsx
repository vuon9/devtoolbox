import React from 'react';

export default function DiffView({ diffs }) {
  const renderDiff = () => {
    if (diffs.length === 0) {
      return <span style={{ color: 'var(--muted-foreground)' }}>No differences</span>;
    }

    return diffs.map((part, index) => {
      const isAdded = part.added;
      const isRemoved = part.removed;

      let style = {
        display: 'block',
        padding: '1px 4px',
        margin: '1px 0',
      };

      if (isAdded) {
        style = {
          ...style,
          backgroundColor: 'rgb(from var(--success) r g b / 0.2)',
          color: '#fff',
        };
      } else if (isRemoved) {
        style = {
          ...style,
          backgroundColor: 'rgb(from var(--destructive) r g b / 0.2)',
          color: '#fff',
        };
      }

      const prefix = isAdded ? '+ ' : isRemoved ? '- ' : '  ';

      return (
        <span key={index} style={style}>
          <span style={{ userSelect: 'none', opacity: 0.7 }}>{prefix}</span>
          {part.value}
        </span>
      );
    });
  };

  return (
    <div
      className="pane"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '30px',
          marginBottom: '0.5rem',
        }}
      >
        <label
          style={{
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.32px',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
          }}
        >
          Differences
        </label>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          whiteSpace: 'pre-wrap',
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      >
        {renderDiff()}
      </div>
    </div>
  );
}
