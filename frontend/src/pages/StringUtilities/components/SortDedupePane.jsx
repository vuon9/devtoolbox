import React from 'react';

// Inline-styled toggle button
function ToggleButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: 500,
        backgroundColor: active ? '#2563eb' : 'transparent',
        color: active ? '#ffffff' : '#a1a1aa',
        border: active ? '1px solid #2563eb' : '1px solid #27272a',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#27272a';
          e.currentTarget.style.color = '#f4f4f5';
          e.currentTarget.style.borderColor = '#3f3f46';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
          e.currentTarget.style.borderColor = '#27272a';
        }
      }}
    >
      {label}
    </button>
  );
}

export default function SortDedupePane({ onSort, onDedupe }) {
  const [options, setOptions] = React.useState({
    sort: true,
    dedupe: true,
    reverse: false,
    trim: true,
    ignoreEmpty: true,
  });

  const handleToggle = (key) => {
    const newOptions = { ...options, [key]: !options[key] };
    setOptions(newOptions);
    onSort(newOptions);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <ToggleButton
        label="Sort"
        active={options.sort}
        onClick={() => handleToggle('sort')}
      />
      <ToggleButton
        label="Deduplicate"
        active={options.dedupe}
        onClick={() => handleToggle('dedupe')}
      />
      <ToggleButton
        label="Reverse"
        active={options.reverse}
        onClick={() => handleToggle('reverse')}
      />
      <ToggleButton
        label="Trim Lines"
        active={options.trim}
        onClick={() => handleToggle('trim')}
      />
      <ToggleButton
        label="Remove Empty"
        active={options.ignoreEmpty}
        onClick={() => handleToggle('ignoreEmpty')}
      />
    </div>
  );
}