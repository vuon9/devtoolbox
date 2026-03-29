import React, { useState } from 'react';
import BitCell from './BitCell';
import { BIT_ROWS, BIT_CELL_CONFIG } from '../constants';
import { getBit, getByte, formatByte } from '../utils';

/**
 * BitGrid component
 * Displays a 32-bit value as a 4×8 grid of bit cells
 *
 * @param {Object} props
 * @param {number} props.value - Current 32-bit value
 * @param {function} props.onToggleBit - Callback when a bit is toggled
 * @param {string} props.layout - Layout direction ('horizontal' or 'vertical')
 */
const BitGrid = ({ value, onToggleBit, layout = 'horizontal' }) => {
  const [hoveredBit, setHoveredBit] = useState(null);

  const handleToggleBit = (position) => {
    onToggleBit(position);
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <div style={{ width: '100%' }}>
      {/* Bit rows */}
      {BIT_ROWS.map((row) => {
        const byteValue = getByte(value, 3 - row.row); // MSB to LSB
        const byteHex = formatByte(byteValue);

        return (
          <div
            key={row.row}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: row.row < 3 ? `${BIT_CELL_CONFIG.GAP * 2}px` : '0',
            }}
          >
            {/* Row label */}
            <div
              style={{
                width: '60px',
                marginRight: '12px',
                fontSize: '0.75rem',
                color: 'var(--cds-text-secondary)',
                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span style={{ fontWeight: 600 }}>{`0x${byteHex}`}</span>
              <span style={{ fontSize: '0.65rem' }}>{`[${row.label}]`}</span>
            </div>

            {/* Bit cells */}
            <div
              style={{
                display: 'flex',
                gap: `${BIT_CELL_CONFIG.GAP}px`,
              }}
            >
              {/* Render bits from MSB to LSB for this row */}
              {Array.from({ length: 8 }, (_, i) => {
                // Calculate actual bit position
                // Row 0: bits 31-24 (MSB byte)
                // Row 1: bits 23-16
                // Row 2: bits 15-8
                // Row 3: bits 7-0 (LSB byte)
                const bitPosition = row.endBit - i;
                const bitValue = getBit(value, bitPosition);

                return (
                  <div
                    key={bitPosition}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onMouseEnter={() => setHoveredBit(bitPosition)}
                    onMouseLeave={() => setHoveredBit(null)}
                  >
                    <BitCell
                      bitValue={bitValue}
                      position={bitPosition}
                      onToggle={handleToggleBit}
                      isActive={hoveredBit === bitPosition}
                    />
                    {/* Bit position label */}
                    <span
                      style={{
                        fontSize: '0.6rem',
                        color:
                          hoveredBit === bitPosition
                            ? 'var(--cds-text-primary)'
                            : 'var(--cds-text-secondary)',
                        marginTop: '2px',
                        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {bitPosition}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bit position legend */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--cds-layer-01)',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: 'var(--cds-text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>MSB (31) ← → LSB (0)</span>
        <span style={{ fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace" }}>
          {`Value: 0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`}
        </span>
      </div>
    </div>
  );
};

export default BitGrid;
