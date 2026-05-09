import React from 'react';
import { Button } from '../../../components/ui/Button';
import { X } from 'lucide-react';
import DateTimeOutputField from './DateTimeOutputField';
import { OUTPUT_FORMATS } from '../constants';
import {
  formatDate,
  getRelativeTime,
  getDayOfYear,
  getWeekOfYear,
  isLeapYear,
} from '../datetimeHelpers';

export function ResultsGrid({
  parsedDate,
  timezone,
  customTimezones,
  getTimezoneLabel,
  onRemoveTimezone,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '4fr 4fr 8fr', gap: '1rem' }}>
      {/* Column 1: Custom Timezones */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
            }}
          >
            Other timezones
          </div>

          {customTimezones.length === 0 && (
            <div
              style={{
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)',
                fontStyle: 'italic',
              }}
            >
              Select a timezone above to add
            </div>
          )}

          {customTimezones.map((tzId) => (
            <div key={tzId} style={{ position: 'relative' }}>
              <DateTimeOutputField
                label={getTimezoneLabel(tzId)}
                value={formatDate(parsedDate, 'sql', tzId)}
              />
              <Button
                variant="danger"
                onClick={() => onRemoveTimezone(tzId)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '4px',
                  zIndex: 1,
                }}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Primary Outputs */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          Format
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <DateTimeOutputField label="Local" value={formatDate(parsedDate, 'sql', 'local')} />
          <DateTimeOutputField
            label="UTC (ISO 8601)"
            value={formatDate(parsedDate, 'iso', 'UTC')}
          />
          <DateTimeOutputField label="Relative" value={getRelativeTime(parsedDate)} />
          <DateTimeOutputField
            label="Unix time"
            value={Math.floor(parsedDate.getTime() / 1000).toString()}
          />
        </div>
      </div>

      {/* Column 3: Metadata + Other Formats */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ marginTop: '0.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Other formats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem' }}>
              {OUTPUT_FORMATS.map((fmt) => (
                <DateTimeOutputField
                  key={fmt.id}
                  label={fmt.label}
                  value={formatDate(parsedDate, fmt.id, timezone)}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
                marginBottom: '0.5rem',
                marginTop: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Additional
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.2rem' }}>
              <DateTimeOutputField
                label="Day of year"
                value={getDayOfYear(parsedDate)?.toString() || ''}
              />
              <DateTimeOutputField
                label="Week of year"
                value={getWeekOfYear(parsedDate)?.toString() || ''}
              />
              <DateTimeOutputField
                label="Leap year?"
                value={isLeapYear(parsedDate.getFullYear()) ? 'Yes' : 'No'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
