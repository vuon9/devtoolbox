import React, { useState, useEffect } from 'react';
import { Button, TextInput, Tag, ComboBox } from '@carbon/react';
import { Time, Sun, Moon, Sunrise, SendToBack, Calendar, Clean, Close, Add } from '@carbon/icons-react';
import { ToolHeader, ToolControls } from '../../components/ToolUI';
import DateTimeOutputField from '../../components/DateTimeOutputField';
import { getDayOfYear, getWeekOfYear, isLeapYear, parseMathExpression } from '../../utils/datetimeHelpers';
import storage from '../../utils/storage';

// Output formats for "Other formats" section
const OUTPUT_FORMATS = [
  { id: 'iso', label: 'ISO 8601' },
  { id: 'rfc2822', label: 'RFC 2822' },
  { id: 'sql', label: 'SQL DateTime' },
  { id: 'us', label: 'US Format' },
  { id: 'eu', label: 'EU Format' },
  { id: 'compact', label: 'Compact' },
];

// Common timezones
const TIMEZONES = [
  { id: 'local', label: 'Local Time' },
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'America/Chicago', label: 'Chicago' },
  { id: 'America/Denver', label: 'Denver' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Paris', label: 'Paris' },
  { id: 'Asia/Kolkata', label: 'India' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Australia/Sydney', label: 'Sydney' },
];

// Extended timezone list for "Add timezone" dropdown
const ALL_TIMEZONES = [
  ...TIMEZONES,
  { id: 'Asia/Shanghai', label: 'Shanghai' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'Europe/Moscow', label: 'Moscow' },
  { id: 'Pacific/Auckland', label: 'Auckland' },
  { id: 'Pacific/Honolulu', label: 'Honolulu' },
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
];

// Storage key
const STORAGE_KEY = 'datetime-converter.timezones';

// Helper for presets
const toSQLFormat = (d) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Presets
const PRESETS = [
  { id: 'now', label: 'Now', getValue: () => toSQLFormat(new Date()), icon: Time },
  {
    id: 'startofday',
    label: 'Start of Day',
    getValue: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return toSQLFormat(d);
    },
    icon: Sun,
  },
  {
    id: 'endofday',
    label: 'End of Day',
    getValue: () => {
      const d = new Date();
      d.setHours(23, 59, 59, 0);
      return toSQLFormat(d);
    },
    icon: Moon,
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    getValue: () => toSQLFormat(new Date(Date.now() + 86400000)),
    icon: Sunrise,
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getValue: () => toSQLFormat(new Date(Date.now() - 86400000)),
    icon: SendToBack,
  },
  {
    id: 'nextweek',
    label: 'Next Week',
    getValue: () => toSQLFormat(new Date(Date.now() + 604800000)),
    icon: Calendar,
  },
];

// Parse input to Date object (handles math expressions)
function parseInput(input) {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim();

  // Try math expression first
  const mathResult = parseMathExpression(trimmed);
  if (mathResult !== null) {
    // Treat as timestamp (seconds) and convert to date
    return new Date(mathResult * 1000);
  }

  // Try as timestamp (numeric)
  if (/^\d+$/.test(trimmed)) {
    const ts = parseInt(trimmed, 10);
    const len = trimmed.length;

    if (len === 10) {
      return new Date(ts * 1000);
    } else if (len === 13) {
      return new Date(ts);
    } else if (len === 16) {
      return new Date(ts / 1000);
    } else if (len === 19) {
      return new Date(ts / 1000000);
    } else if (ts > 1000000000) {
      return new Date(ts * 1000);
    }
  }

  // Try as date string
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

// Helper to get date object shifted to target timezone
function getShiftedDate(date, timezone) {
  let year, month, day, hour, minute, second;

  if (timezone === 'local') {
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();
  } else {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(date);
      const p = {};
      parts.forEach(({ type, value }) => (p[type] = value));
      year = parseInt(p.year, 10);
      month = parseInt(p.month, 10) - 1;
      day = parseInt(p.day, 10);
      hour = parseInt(p.hour, 10) % 24;
      minute = parseInt(p.minute, 10);
      second = parseInt(p.second, 10);
    } catch (e) {
      return date;
    }
  }

  return new Date(Date.UTC(year, month, day, hour, minute, second, date.getMilliseconds()));
}

// Format date according to format
function formatDate(date, formatId, timezone) {
  if (!date || isNaN(date.getTime())) return '';

  const d = getShiftedDate(date, timezone);
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());

  switch (formatId) {
    case 'iso':
      return d.toISOString();
    case 'rfc2822':
      return d.toUTCString();
    case 'sql':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'us':
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    case 'eu':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'compact':
      return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    default:
      return d.toISOString();
  }
}

// Calculate relative time
function getRelativeTime(date) {
  if (!date || isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let result = '';
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
  else if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
  else if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  else result += `${seconds} second${seconds > 1 ? 's' : ''} `;

  return isFuture ? `in ${result}` : `${result}ago`;
}

export default function DateTimeConverter() {
  // Main input
  const [input, setInput] = useState('');
  const [timezone, setTimezone] = useState('local');

  // Parsed result
  const [parsedDate, setParsedDate] = useState(null);
  const [error, setError] = useState(null);

  // Custom timezones
  const [customTimezones, setCustomTimezones] = useState([]);
  const [selectedNewTimezone, setSelectedNewTimezone] = useState(null);

  // Load custom timezones from storage on mount
  useEffect(() => {
    const saved = storage.getArray(STORAGE_KEY);
    setCustomTimezones(saved);
  }, []);

  // Parse input
  useEffect(() => {
    const date = parseInput(input);
    if (date && !isNaN(date.getTime())) {
      setParsedDate(date);
      setError(null);
    } else if (input.trim()) {
      setError('Invalid date or timestamp');
      setParsedDate(null);
    } else {
      setError(null);
      setParsedDate(null);
    }
  }, [input]);

  const handlePreset = (preset) => {
    setInput(preset.getValue().toString());
  };

  const addTimezone = () => {
    if (selectedNewTimezone && !customTimezones.includes(selectedNewTimezone.id)) {
      const newTimezones = [...customTimezones, selectedNewTimezone.id];
      setCustomTimezones(newTimezones);
      storage.setArray(STORAGE_KEY, newTimezones);
      setSelectedNewTimezone(null);
    }
  };

  const removeTimezone = (tzId) => {
    const newTimezones = customTimezones.filter((id) => id !== tzId);
    setCustomTimezones(newTimezones);
    storage.setArray(STORAGE_KEY, newTimezones);
  };

  // Get available timezones for dropdown (exclude already added)
  const availableTimezones = ALL_TIMEZONES.filter(
    (tz) => !customTimezones.includes(tz.id)
  );

  return (
    <div
      className="tool-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
    >
      <ToolHeader
        title="DateTime Converter"
        description="Convert between timestamps and date formats. Supports Unix timestamps, ISO dates, math expressions (+, -, *, /), and various formats."
      />

      {/* Control Section */}
      <ToolControls>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              kind="tertiary"
              onClick={() => handlePreset(preset)}
              renderIcon={preset?.icon}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </ToolControls>

      <ToolControls>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            flexWrap: 'wrap',
            flex: 1,
          }}
        >
          <div style={{ flex: 1, minWidth: '300px' }}>
            <TextInput
              id="datetime-input"
              labelText="Input Date/Time (or Unix timestamp)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 1738412345, 2026-02-01T12:24:05Z, 1738412345 + 3600..."
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
              Math operators + - * / are supported
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ComboBox
              id="timezone"
              titleText="Input timezone"
              items={TIMEZONES}
              itemToString={(item) => (item ? item.label : '')}
              selectedItem={TIMEZONES.find((t) => t.id === timezone)}
              onChange={({ selectedItem }) => selectedItem && setTimezone(selectedItem.id)}
              style={{ minWidth: '200px' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem', visibility: 'hidden' }}>
              placeholder
            </div>
          </div>
        </div>
      </ToolControls>

      {/* Error */}
      {error && <Tag type="red">{error}</Tag>}

      {/* Results Section */}
      {parsedDate && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Left Column - Primary Outputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DateTimeOutputField
                label="Local"
                value={formatDate(parsedDate, 'sql', 'local')}
              />
              <DateTimeOutputField
                label="UTC (ISO 8601)"
                value={formatDate(parsedDate, 'iso', 'UTC')}
              />
              <DateTimeOutputField
                label="Relative"
                value={getRelativeTime(parsedDate)}
              />
              <DateTimeOutputField
                label="Unix time"
                value={Math.floor(parsedDate.getTime() / 1000).toString()}
              />
            </div>

            {/* Right Column - Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Three fields in a row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <DateTimeOutputField
                  label="Day of year"
                  value={getDayOfYear(parsedDate)?.toString() || ''}
                  style={{ flex: 1 }}
                />
                <DateTimeOutputField
                  label="Week of year"
                  value={getWeekOfYear(parsedDate)?.toString() || ''}
                  style={{ flex: 1 }}
                />
                <DateTimeOutputField
                  label="Is leap year?"
                  value={isLeapYear(parsedDate.getFullYear()) ? 'Yes' : 'No'}
                  style={{ flex: 1 }}
                />
              </div>

              {/* Other formats section - 2 per row */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Other formats
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {OUTPUT_FORMATS.map((fmt) => (
                    <DateTimeOutputField
                      key={fmt.id}
                      label={fmt.label}
                      value={formatDate(parsedDate, fmt.id, timezone)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Timezones Section - Horizontal Layout */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Other timezones:
              </span>
              <ComboBox
                id="add-timezone"
                titleText=""
                placeholder="Add timezone..."
                items={availableTimezones}
                itemToString={(item) => (item ? item.label : '')}
                selectedItem={selectedNewTimezone}
                onChange={({ selectedItem }) => setSelectedNewTimezone(selectedItem)}
                style={{ minWidth: '160px', maxWidth: '180px' }}
                size="sm"
              />
              <Button
                size="sm"
                onClick={addTimezone}
                disabled={!selectedNewTimezone}
                renderIcon={Add}
                iconDescription="Add timezone"
              >
                Add
              </Button>

              {customTimezones.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    flex: 1,
                    paddingBottom: '0.25rem',
                  }}
                >
                  {customTimezones.map((tzId) => {
                    const tz = ALL_TIMEZONES.find((t) => t.id === tzId) || { id: tzId, label: tzId };
                    return (
                      <div
                        key={tzId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--cds-layer)',
                          borderRadius: '4px',
                          border: '1px solid var(--cds-border-subtle)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                            {tz.label}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontFamily: "'IBM Plex Mono', monospace" }}>
                            {formatDate(parsedDate, 'sql', tzId)}
                          </div>
                        </div>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Close}
                          iconDescription="Remove timezone"
                          onClick={() => removeTimezone(tzId)}
                          style={{
                            minHeight: '1.5rem',
                            padding: '0 0.25rem',
                            marginLeft: '0.25rem',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
