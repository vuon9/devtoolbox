import React from 'react';
import { Button, ButtonSet } from '@carbon/react';
import { BITWISE_OPERATIONS } from '../constants';

/**
 * BitwiseToolbar component
 * Displays buttons for common bitwise operations
 *
 * @param {Object} props
 * @param {function} props.onOperation - Callback when an operation is clicked
 */
const BitwiseToolbar = ({ onOperation }) => {
  const operations = [
    BITWISE_OPERATIONS.SHIFT_LEFT,
    BITWISE_OPERATIONS.SHIFT_RIGHT,
    BITWISE_OPERATIONS.NOT,
    BITWISE_OPERATIONS.MASK_BYTE,
    BITWISE_OPERATIONS.SET_LSB,
  ];

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--cds-layer-01)',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          color: 'var(--cds-text-secondary)',
          marginBottom: '0.75rem',
          letterSpacing: '0.32px',
        }}
      >
        Bitwise Operations
      </div>

      <ButtonSet
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {operations.map((op) => (
          <Button
            key={op.id}
            kind="secondary"
            size="sm"
            onClick={() => onOperation(op.id)}
            title={op.description}
          >
            {op.label}
          </Button>
        ))}
      </ButtonSet>
    </div>
  );
};

export default BitwiseToolbar;
