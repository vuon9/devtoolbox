import React, { useState, useEffect } from 'react';

// Inline-styled checkbox component
function Checkbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: '14px',
        color: '#a1a1aa',
        marginRight: '16px',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          accentColor: '#2563eb',
          cursor: 'pointer',
        }}
      />
      {label}
    </label>
  );
}

export default function SortDedupePane({ onSort, onDedupe }) {
  const [options, setOptions] = useState({
    sort: true,
    dedupe: true,
    reverse: false,
    trim: true,
    ignoreEmpty: true,
  });

  const handleOptionChange = (key, value) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    onSort(newOptions);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <Checkbox
        id="chk-sort"
        label="Sort"
        checked={options.sort}
        onChange={(val) => handleOptionChange('sort', val)}
      />
      <Checkbox
        id="chk-dedupe"
        label="Deduplicate"
        checked={options.dedupe}
        onChange={(val) => handleOptionChange('dedupe', val)}
      />
      <Checkbox
        id="chk-reverse"
        label="Reverse"
        checked={options.reverse}
        onChange={(val) => handleOptionChange('reverse', val)}
      />
      <Checkbox
        id="chk-trim"
        label="Trim Lines"
        checked={options.trim}
        onChange={(val) => handleOptionChange('trim', val)}
      />
      <Checkbox
        id="chk-empty"
        label="Remove Empty"
        checked={options.ignoreEmpty}
        onChange={(val) => handleOptionChange('ignoreEmpty', val)}
      />
    </div>
  );
}