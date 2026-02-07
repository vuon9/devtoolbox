import React, { useState, useEffect } from 'react';
import { Button, TextInput, Tag, Tile, CopyButton, ComboBox } from '@carbon/react';
import {
    Time, Sun, Moon,
    Sunrise,
    SendToBack,
    Calendar,
    Clean
} from '@carbon/icons-react';
import { ToolHeader, ToolControls } from '../../components/ToolUI';

// Output formats
const OUTPUT_FORMATS = [
    { id: 'iso', label: 'ISO 8601' },
    { id: 'rfc2822', label: 'RFC 2822' },
    { id: 'sql', label: 'SQL DateTime' },
    { id: 'us', label: 'US Format' },
    { id: 'eu', label: 'EU Format' },
    { id: 'compact', label: 'Compact' },
];

// Timezones
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

// Helper for presets
const toSQLFormat = (d) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Presets
const PRESETS = [
    { id: 'now', label: 'Now', getValue: () => toSQLFormat(new Date()), icon: Time },
    {
        id: 'startofday', label: 'Start of Day', getValue: () => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            return toSQLFormat(d);
        },
        icon: Sun,
    },
    {
        id: 'endofday', label: 'End of Day', getValue: () => {
            const d = new Date();
            d.setHours(23, 59, 59, 0);
            return toSQLFormat(d);
        },
        icon: Moon
    },
    { id: 'tomorrow', label: 'Tomorrow', getValue: () => toSQLFormat(new Date(Date.now() + 86400000)), icon: Sunrise },
    { id: 'yesterday', label: 'Yesterday', getValue: () => toSQLFormat(new Date(Date.now() - 86400000)), icon: SendToBack },
    { id: 'nextweek', label: 'Next Week', getValue: () => toSQLFormat(new Date(Date.now() + 604800000)), icon: Calendar },
];

// Parse input to Date object
function parseInput(input) {
    if (!input || !input.trim()) return null;

    const trimmed = input.trim();

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

// Helper to get date object shifted to target timezone (so UTC getters return target time)
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
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
            }).formatToParts(date);
            const p = {};
            parts.forEach(({ type, value }) => p[type] = value);
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
    const [outputFormat, setOutputFormat] = useState('iso');
    const [outputTimezone, setOutputTimezone] = useState('local');
    const [timezone, setTimezone] = useState('local');

    // Parsed result
    const [parsedDate, setParsedDate] = useState(null);
    const [error, setError] = useState(null);

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

    const copyToClipboard = (text) => {
        if (text) navigator.clipboard.writeText(text);
    };

    const handlePreset = (preset) => {
        setInput(preset.getValue().toString());
    };

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'auto' }}>
            <ToolHeader
                title="DateTime Converter"
                description="Convert between timestamps and date formats. Supports Unix timestamps, ISO dates, and various formats."
            />

            {/* Main Input Section */}
            <ToolControls>
                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    <div style={{
                        minWidth: '350px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        flexWrap: 'nowrap',
                        gap: '1rem',
                    }}>
                        <TextInput
                            id="datetime-input"
                            labelText="Input Date/Time (or Unix timestamp)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., 1738412345, 2026-02-01T12:24:05Z, 02/01/2026..."
                            style={{ fontFamily: "'IBM Plex Mono', monospace", minWidth: '350px' }}
                        />

                        <ComboBox
                            id="timezone"
                            titleText="Input timezone"
                            items={TIMEZONES}
                            itemToString={(item) => item ? item.label : ''}
                            selectedItem={TIMEZONES.find(t => t.id === timezone)}
                            onChange={({ selectedItem }) => selectedItem && setTimezone(selectedItem.id)}
                            style={{ minWidth: '250px' }}
                        />

                        <Button size={"md"} kind="primary" onClick={() => setInput('')} renderIcon={Clean}>
                            Clear
                        </Button>
                    </div>
                </div>
            </ToolControls>

            {/* Settings */}
            <ToolControls>
                <ComboBox
                    id="output-format"
                    titleText="Output Format"
                    items={OUTPUT_FORMATS}
                    itemToString={(item) => item ? item.label : ''}
                    selectedItem={OUTPUT_FORMATS.find(f => f.id === outputFormat)}
                    onChange={({ selectedItem }) => selectedItem && setOutputFormat(selectedItem.id)}
                    style={{ minWidth: '250px' }}
                />
                <ComboBox
                    id="output-timezone"
                    titleText="Output Timezone"
                    items={TIMEZONES}
                    itemToString={(item) => item ? item.label : ''}
                    selectedItem={TIMEZONES.find(t => t.id === timezone)}
                    onChange={({ selectedItem }) => selectedItem && setOutputTimezone(selectedItem.id)}
                    style={{ minWidth: '250px' }}
                    defaultValue={'local'}
                />
            </ToolControls>

            {/* Error */}
            {error && <Tag type="red">{error}</Tag>}

            {/* Main Result */}
            {parsedDate && (
                <Tile style={{ background: 'var(--cds-layer)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {formatDate(parsedDate, outputFormat, outputTimezone)}
                            </span>
                            <CopyButton onClick={() => copyToClipboard(formatDate(parsedDate, outputFormat, outputTimezone))} size="sm" />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)', flexWrap: 'wrap' }}>
                            <Tag type="blue">{getRelativeTime(parsedDate)}</Tag>
                            <span>Unix: {Math.floor(parsedDate.getTime() / 1000)}</span>
                            <span>•</span>
                            <span>Unix (ms): {parsedDate.getTime()}</span>
                        </div>
                    </div>
                </Tile>
            )}

            {/* All Formats */}
            {parsedDate && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {OUTPUT_FORMATS.map((fmt) => (
                        <Tile key={fmt.id} style={{ padding: '0.75rem', background: 'var(--cds-layer)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                                {fmt.label}
                            </div>
                            <div style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {formatDate(parsedDate, fmt.id, timezone)}
                                </span>
                                <CopyButton onClick={() => copyToClipboard(formatDate(parsedDate, fmt.id, timezone))} size="sm" />
                            </div>
                        </Tile>
                    ))}
                </div>
            )}
        </div>
    );
}
