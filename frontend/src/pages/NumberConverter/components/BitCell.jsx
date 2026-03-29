import React from 'react';
import { BIT_CELL_CONFIG } from '../constants';

/**
 * Individual bit cell component
 * Displays a single bit (0 or 1) as a clickable toggle
 *
 * @param {Object} props
 * @param {number} props.bitValue - Current bit value (0 or 1)
 * @param {number} props.position - Bit position (0-31)
 * @param {function} props.onToggle - Callback when bit is toggled
 * @param {boolean} props.isActive - Whether this is the active/hovered cell
 */
const BitCell = ({ bitValue, position, onToggle, isActive = false }) => {
  const isSet = bitValue === 1;

  const handleClick = () => {
    onToggle(position);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(position);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSet}
      aria-label={`Bit ${position}, value ${bitValue}`}
      style={{
        width: `${BIT_CELL_CONFIG.SIZE}px`,
        height: `${BIT_CELL_CONFIG.SIZE}px`,
        border: isSet ? 'none' : `2px solid ${BIT_CELL_CONFIG.INACTIVE_BORDER}`,
        backgroundColor: isSet ? BIT_CELL_CONFIG.ACTIVE_COLOR : 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        fontSize: '14px',
        fontWeight: 600,
        color: isSet ? 'var(--cds-text-inverse)' : 'var(--cds-text-primary)',
        transition: 'all 0.15s ease',
        transform: isActive ? `scale(${BIT_CELL_CONFIG.HOVER_SCALE})` : 'scale(1)',
        boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${BIT_CELL_CONFIG.HOVER_SCALE})`;
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--cds-focus)';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {isSet ? '1' : '0'}
    </button>
  );
};

export default BitCell;
