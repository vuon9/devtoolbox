import React, { useState, useEffect } from 'react';
import { Button, CopyButton, TextInput } from '@carbon/react';
import { Copy } from '@carbon/icons-react';

export default function ColorInputRow({ label, value, onChange, copyValue, onCopy, placeholder }) {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  // Update local value when prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
    // Reset to displayed value if invalid
    setLocalValue(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onChange(localValue);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--cds-border-subtle)',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--cds-text-secondary)',
          fontWeight: 500,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      <TextInput
        id={`input-${label}`}
        labelText=""
        hideLabel
        value={isEditing ? localValue : value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          border: 'none',
          background: 'transparent',
        }}
        size="md"
      />

      <CopyButton
        autoAlign
        onClick={() => onCopy(copyValue)}
      />
    </div>
  );
}
