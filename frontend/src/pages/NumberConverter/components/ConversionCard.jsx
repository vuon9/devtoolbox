import React from 'react';
import { TextInput, Button } from '@carbon/react';
import { Copy, ArrowUp } from '@carbon/icons-react';
import { BASES } from '../constants';
import { formatNumber } from '../utils';

/**
 * ConversionCard component
 * Displays a number input for a specific base with copy/sync functionality
 * 
 * @param {Object} props
 * @param {string} props.label - Display label (e.g., "Decimal")
 * @param {number} props.base - Numeric base (2, 8, 10, 16, or custom)
 * @param {number} props.value - Current numeric value
 * @param {string} props.error - Error message (if any)
 * @param {function} props.onChange - Callback when input changes
 * @param {function} props.onCopy - Callback when copy button clicked
 * @param {function} props.onSync - Callback when sync button clicked (optional)
 * @param {boolean} props.isCustom - Whether this is the custom base card
 * @param {number} props.customBase - Custom base value (if isCustom)
 * @param {function} props.onCustomBaseChange - Callback when custom base changes
 * @param {string} props.placeholder - Placeholder text for input
 */
const ConversionCard = ({
  label,
  base,
  value,
  error,
  onChange,
  onCopy,
  onSync,
  isCustom = false,
  customBase,
  onCustomBaseChange,
  placeholder,
}) => {
  // Format the current value for display
  const displayValue = formatNumber(value, isCustom ? customBase : base);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleCopy = () => {
    onCopy(displayValue);
  };

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: 'var(--cds-layer-01)',
        borderRadius: '4px',
        border: error ? '1px solid var(--cds-support-error)' : '1px solid transparent',
      }}
    >
      {/* Header with label and actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--cds-text-primary)',
              letterSpacing: '0.32px',
            }}
          >
            {label}
          </span>
          {!isCustom && (
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--cds-text-secondary)',
              }}
            >
              {`(Base ${base})`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onSync && (
            <Button
              kind="ghost"
              size="sm"
              renderIcon={ArrowUp}
              iconDescription="Use as input source"
              onClick={onSync}
              hasIconOnly
            />
          )}
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Copy}
            iconDescription="Copy to clipboard"
            onClick={handleCopy}
            disabled={!displayValue}
            hasIconOnly
          />
        </div>
      </div>

      {/* Input field */}
      <TextInput
        id={`conversion-${label.toLowerCase().replace(/\s+/g, '-')}`}
        labelText={label}
        hideLabel
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder || (isCustom ? `Base ${customBase}` : BASES[Object.keys(BASES).find(k => BASES[k].base === base)]?.placeholder || `Enter ${label.toLowerCase()}...`)}
        invalid={!!error}
        invalidText={error}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      />
    </div>
  );
};

export default ConversionCard;
