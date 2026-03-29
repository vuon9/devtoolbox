import React, { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

export function CopyableHex({
  hex,
  showHash = true,
  showTooltip = true,
  tooltipDuration = 2000,
  uppercase = false,
  onCopy,
  className,
  style = {},
  showColorPreview = true,
}) {
  const [copied, setCopied] = useState(false);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, tooltipDuration);
      return () => clearTimeout(timer);
    }
  }, [copied, tooltipDuration]);

  const handleCopy = useCallback(async () => {
    if (!hex) return;

    try {
      await navigator.clipboard.writeText(hex);

      if (onCopy) {
        onCopy(hex);
      }

      setCopied(true);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, [hex, onCopy]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCopy();
      }
    },
    [handleCopy]
  );

  // Format the display value
  const displayValue = uppercase ? hex.toUpperCase() : hex.toLowerCase();
  const displayHex = showHash ? displayValue : displayValue.replace(/^#/, '');

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#f4f4f5',
    transition: 'background-color 0.15s ease',
    position: 'relative',
    userSelect: 'none',
    ...style,
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Copy color ${hex}`}
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      className={cn('group', className)}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#18181b';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = '#09090b';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
      }}
    >
      {/* Color preview dot */}
      {showColorPreview && (
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: hex,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0,
          }}
        />
      )}

      {/* Hex value */}
      <span>{displayHex}</span>

      {/* Copied tooltip/checkmark */}
      {showTooltip && copied && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            marginLeft: '2px',
            color: '#22c55e',
            fontSize: '11px',
          }}
        >
          <Check className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}

export default CopyableHex;
