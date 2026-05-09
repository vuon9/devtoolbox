import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Copy } from 'lucide-react';

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
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--muted-foreground)',
          fontWeight: 500,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      <Input
        id={`input-${label}`}
        value={isEditing ? localValue : value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="font-mono border-none bg-transparent"
        style={{
          padding: '0.5rem',
          margin: '0.5rem 0',
          boxShadow: 'none',
        }}
      />

      <Button variant="secondary" onClick={() => onCopy(copyValue)} style={{ padding: '4px' }}>
        <Copy size={14} />
      </Button>
    </div>
  );
}
