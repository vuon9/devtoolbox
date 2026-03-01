import React from 'react';
import { Tile, CopyButton } from '@carbon/react';
import { getMonospaceFontFamily, getDataFontSize } from '../../../utils/inputUtils';

/**
 * Display-only output field with label and copy button
 *
 * @param {Object} props
 * @param {string} props.label - Label text displayed above the value
 * @param {string} props.value - Value to display
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {Object} [props.style] - Additional inline styles for the container
 */
export default function DateTimeOutputField({ label, value, className, style }) {
  return (
    <Tile className={className} style={{ padding: '0.75rem', background: 'var(--cds-layer)', ...style }}>
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--cds-text-secondary)',
          marginBottom: '0.25rem',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: getMonospaceFontFamily(),
          fontSize: getDataFontSize(),
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </span>
        <CopyButton onClick={() => navigator.clipboard.writeText(value)} size="sm" />
      </div>
    </Tile>
  );
}
