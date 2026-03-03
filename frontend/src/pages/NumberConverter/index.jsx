import React, { useState, useCallback } from 'react';
import { TextInput, Button, Tile, Grid, Column } from '@carbon/react';
import { Copy, TrashCan, ChevronRight } from '@carbon/icons-react';
import { ToolHeader } from '../../components/ToolUI';
import { parseBinary, parseOctal, parseDecimal, parseHex, formatNumber } from './utils';

/**
 * NumberConverter - Clean Single-Input Design
 *
 * One input field, all conversions displayed as results
 */
const NumberConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState('decimal');
  const [error, setError] = useState('');
  const [currentValue, setCurrentValue] = useState(0);

  const bases = [
    { id: 'decimal', label: 'Decimal', base: 10, prefix: '', example: '255' },
    { id: 'hex', label: 'Hex', base: 16, prefix: '0x', example: 'FF' },
    { id: 'binary', label: 'Binary', base: 2, prefix: '0b', example: '11111111' },
    { id: 'octal', label: 'Octal', base: 8, prefix: '0o', example: '377' },
  ];

  const parseFunctions = {
    decimal: parseDecimal,
    hex: parseHex,
    binary: parseBinary,
    octal: parseOctal,
  };

  const handleInputChange = (value) => {
    setInputValue(value);

    if (!value.trim()) {
      setCurrentValue(0);
      setError('');
      return;
    }

    const result = parseFunctions[inputBase](value);

    if (result.error) {
      setError(result.error);
    } else {
      setCurrentValue(result.value);
      setError('');
    }
  };

  const handleBaseChange = (baseId) => {
    setInputBase(baseId);
    // Convert current value to new base format
    const base = bases.find((b) => b.id === baseId)?.base || 10;
    const newValue = formatNumber(currentValue, base);
    setInputValue(newValue);
    setError('');
  };

  const handleClear = () => {
    setInputValue('');
    setCurrentValue(0);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const currentBase = bases.find((b) => b.id === inputBase);

  return (
    <Grid
      fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      <Column>
        <ToolHeader
          title="Number Converter"
          description="Enter a number and select its format. All conversions update instantly."
        />
      </Column>

      {/* Main Input Section */}
      <Column>
        <Tile style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.32px',
                color: 'var(--cds-text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              Enter Number
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {bases.map((base) => (
                <Button
                  key={base.id}
                  kind={inputBase === base.id ? 'primary' : 'tertiary'}
                  size="sm"
                  onClick={() => handleBaseChange(base.id)}
                >
                  {base.label}
                </Button>
              ))}
            </div>

            <TextInput
              id="main-input"
              labelText="Number"
              hideLabel
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Enter ${currentBase?.label.toLowerCase()} number...`}
              invalid={!!error}
              invalidText={error}
              size="lg"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          </div>

          {inputValue && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: 'var(--cds-layer-02)',
                borderRadius: '4px',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                Decimal value: <strong>{currentValue.toLocaleString()}</strong>
              </span>
              <Button kind="ghost" size="sm" renderIcon={TrashCan} onClick={handleClear}>
                Clear
              </Button>
            </div>
          )}
        </Tile>
      </Column>

      {/* Results Grid */}
      <Column>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {bases.map((base) => {
            if (base.id === inputBase) return null; // Skip current input base

            const value = formatNumber(currentValue, base.base);
            const displayValue = value || '-';

            return (
              <Tile
                key={base.id}
                style={{
                  padding: '1rem',
                  position: 'relative',
                  opacity: inputValue ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--cds-text-secondary)',
                        letterSpacing: '0.32px',
                      }}
                    >
                      {base.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-helper)',
                      }}
                    >
                      Base {base.base}
                    </div>
                  </div>

                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Copy}
                    iconDescription="Copy"
                    onClick={() => copyToClipboard(value)}
                    disabled={!value}
                    hasIconOnly
                  />
                </div>

                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: 'var(--cds-text-primary)',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                  }}
                >
                  {base.prefix}
                  {displayValue}
                </div>

                {!inputValue && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--cds-text-helper)',
                      marginTop: '0.5rem',
                      fontStyle: 'italic',
                    }}
                  >
                    e.g., {base.prefix}
                    {base.example}
                  </div>
                )}
              </Tile>
            );
          })}
        </div>
      </Column>

      {/* Quick Tips */}
      <Column>
        <Tile style={{ padding: '1rem' }}>
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
            Common Values
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {[
              { dec: '255', hex: 'FF', bin: '11111111' },
              { dec: '256', hex: '100', bin: '100000000' },
              { dec: '1024', hex: '400', bin: '10000000000' },
              { dec: '4096', hex: '1000', bin: '1000000000000' },
            ].map((row, idx) => (
              <Button
                key={idx}
                kind="ghost"
                size="sm"
                onClick={() => {
                  setInputBase('decimal');
                  handleInputChange(row.dec);
                }}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {row.dec} <ChevronRight size={14} /> 0x{row.hex}
              </Button>
            ))}
          </div>
        </Tile>
      </Column>
    </Grid>
  );
};

export default NumberConverter;
