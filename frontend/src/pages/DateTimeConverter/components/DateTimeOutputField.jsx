import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Copy } from 'lucide-react';
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
    <div
      className={className}
      style={{ padding: '0.75rem', background: 'var(--card)', borderRadius: '4px', border: '1px solid var(--border)', ...style }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--muted-foreground)',
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
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(value)}
          style={{ padding: '4px' }}
        >
          <Copy size={14} />
        </Button>
      </div>
    </div>
  );
}
