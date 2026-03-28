import React from 'react';
import { Columns, Rows } from 'lucide-react';
import { TOGGLE_POSITIONS } from './constants';

/**
 * Layout toggle button for switching between horizontal and vertical layouts
 *
 * @param {Object} props
 * @param {'horizontal'|'vertical'} props.direction - Current layout direction
 * @param {Function} props.onToggle - Callback when toggle is clicked
 * @param {string} [props.position='top-right'] - Position styling
 * @param {boolean} [props.disabled=false] - Whether toggle is disabled
 * @param {Object} [props.style={}] - Additional styles
 */
export default function ToolLayoutToggle({
  direction,
  onToggle,
  position = 'top-right',
  disabled = false,
  style = {},
}) {
  const isHorizontal = direction === 'horizontal';

  // Position styling based on position prop
  const positionStyles = {
    'top-right': {
      position: 'absolute',
      top: '0',
      right: '0',
      zIndex: 10,
    },
    controls: {
      marginLeft: 'auto',
    },
    floating: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      zIndex: 10,
      backgroundColor: '#1c1917',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
  };

  const containerStyle = {
    ...(positionStyles[position] || positionStyles['top-right']),
    ...style,
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={onToggle}
        disabled={disabled}
        title={isHorizontal ? 'Switch to vertical layout' : 'Switch to horizontal layout'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          padding: '6px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          color: disabled ? '#3f3f46' : '#a1a1aa',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = disabled ? '#3f3f46' : '#a1a1aa';
        }}
      >
        {isHorizontal ? (
          <Rows style={{ width: '16px', height: '16px' }} />
        ) : (
          <Columns style={{ width: '16px', height: '16px' }} />
        )}
      </button>
    </div>
  );
}