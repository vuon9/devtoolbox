import React from 'react';

// Toggle button - same style as ModeToggle in TextConverter
function ToggleButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '6px',
        border: '1px solid',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        backgroundColor: active ? '#2563eb' : '#18181b',
        color: active ? '#ffffff' : '#a1a1aa',
        borderColor: active ? '#2563eb' : '#3f3f46',
      }}
      onMouseEnter={(e) => {
        if (active) {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
        } else {
          e.currentTarget.style.backgroundColor = '#27272a';
          e.currentTarget.style.color = '#f4f4f5';
          e.currentTarget.style.borderColor = '#52525b';
        }
      }}
      onMouseLeave={(e) => {
        if (active) {
          e.currentTarget.style.backgroundColor = '#2563eb';
        } else {
          e.currentTarget.style.backgroundColor = '#18181b';
          e.currentTarget.style.color = '#a1a1aa';
          e.currentTarget.style.borderColor = '#3f3f46';
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