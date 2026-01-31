import React, { useState, useEffect } from 'react';
import { Button, TextInput, Tag, Dropdown, TextArea } from '@carbon/react';
import { Time, Calendar } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

const DATE_FORMATS = [
    { id: 'iso', label: 'ISO 8601', format: 'YYYY-MM-DDTHH:mm:ss.sssZ' },
    { id: 'rfc2822', label: 'RFC 2822', format: 'ddd, DD MMM YYYY HH:mm:ss ZZ' },
    { id: 'sql', label: 'SQL DateTime', format: 'YYYY-MM-DD HH:mm:ss' },
    { id: 'us', label: 'US Format', format: 'MM/DD/YYYY HH:mm:ss' },
    { id: 'eu', label: 'EU Format', format: 'DD/MM/YYYY HH:mm:ss' },
    { id: 'compact', label: 'Compact', format: 'YYYYMMDD-HHmmss' },
    { id: 'custom', label: 'Custom', format: 'Custom format' },
];

const TIMEZONES = [
    { id: 'UTC', label: 'UTC', offset: 0 },
    { id: 'local', label: 'Local Time', offset: null },
    { id: 'EST', label: 'EST (New York)', offset: -5 },
    { id: 'CST', label: 'CST (Chicago)', offset: -6 },
    { id: 'MST', label: 'MST (Denver)', offset: -7 },
    { id: 'PST', label: 'PST (Los Angeles)', offset: -8 },
    { id: 'GMT', label: 'GMT (London)', offset: 0 },
    { id: 'CET', label: 'CET (Paris)', offset: 1 },
    { id: 'IST', label: 'IST (India)', offset: 5.5 },
    { id: 'JST', label: 'JST (Tokyo)', offset: 9 },
    { id: 'AEST', label: 'AEST (Sydney)', offset: 10 },
];

const parseDateWithFormat = (input, format) => {
    if (!input) return null;
    
    // Try parsing as ISO first
    let date = new Date(input);
    if (!isNaN(date.getTime())) return date;
    
    // Try parsing as timestamp
    if (!isNaN(input) && input.toString().length >= 10) {
        const ts = parseInt(input, 10);
        if (ts > 1000000000) {
            date = new Date(ts > 9999999999 ? ts : ts * 1000);
            if (!isNaN(date.getTime())) return date;
        }
    }
    
    return null;
};

const formatDate = (date, formatId, customFormat) => {
    if (!date || isNaN(date.getTime())) return '';
    
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    
    switch (formatId) {
        case 'iso':
            return date.toISOString();
        case 'rfc2822':
            return date.toUTCString();
        case 'sql':
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        case 'us':
            return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        case 'eu':
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        case 'compact':
            return `${year}${month}${day}-${hours}${minutes}${seconds}`;
        case 'custom':
            if (customFormat) {
                // Simple format replacement
                return customFormat
                    .replace('YYYY', year)
                    .replace('MM', month)
                    .replace('DD', day)
                    .replace('HH', hours)
                    .replace('mm', minutes)
                    .replace('ss', seconds)
                    .replace('sss', ms);
            }
            return date.toISOString();
        default:
            return date.toISOString();
    }
};

const convertToTimezone = (date, timezoneId) => {
    if (!date || timezoneId === 'local') return date;
    
    const tz = TIMEZONES.find(t => t.id === timezoneId);
    if (!tz || tz.offset === null) return date;
    
    const offsetMs = tz.offset * 60 * 60 * 1000;
    return new Date(date.getTime() + offsetMs);
};

export default function UnixTimeConverter() {
    const [timestamp, setTimestamp] = useState('');
    const [dateStr, setDateStr] = useState('');
    const [localDateStr, setLocalDateStr] = useState('');
    const [relativeTime, setRelativeTime] = useState('');
    const [inputFormat, setInputFormat] = useState('iso');
    const [outputFormat, setOutputFormat] = useState('iso');
    const [customInputFormat, setCustomInputFormat] = useState('YYYY-MM-DD HH:mm:ss');
    const [customOutputFormat, setCustomOutputFormat] = useState('YYYY-MM-DD HH:mm:ss');
    const [sourceTimezone, setSourceTimezone] = useState('local');
    const [targetTimezone, setTargetTimezone] = useState('local');
    const [parsedDate, setParsedDate] = useState(null);

    const layout = useLayoutToggle({
        toolKey: 'unix-time-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Initialize with current time
    useEffect(() => {
        const now = Math.floor(Date.now() / 1000);
        handleTsChange(now.toString());
    }, []);

    const calculateRelativeTime = (date) => {
        if (!date || isNaN(date.getTime())) return '';
        
        const now = Date.now();
        const diff = date.getTime() - now;
        const absDiff = Math.abs(diff);
        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        let relative = '';
        if (diff > 0) {
            relative = 'in ';
        }
        
        if (days > 0) relative += `${days} day${days > 1 ? 's' : ''} `;
        else if (hours > 0) relative += `${hours} hour${hours > 1 ? 's' : ''} `;
        else if (minutes > 0) relative += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        else relative += `${seconds} second${seconds > 1 ? 's' : ''} `;
        
        if (diff <= 0) {
            relative += 'ago';
        }
        
        return relative;
    };

    const handleTsChange = (val) => {
        setTimestamp(val);
        
        if (!val || val.trim() === '') {
            setDateStr('');
            setLocalDateStr('');
            setRelativeTime('');
            setParsedDate(null);
            return;
        }

        // Try parsing as timestamp first
        let date;
        const numVal = parseInt(val, 10);
        
        if (!isNaN(numVal) && val.length >= 10) {
            // Assume it's a Unix timestamp
            const ts = numVal > 9999999999 ? numVal : numVal * 1000;
            date = new Date(ts);
        } else {
            // Try parsing as date string
            date = parseDateWithFormat(val, inputFormat);
        }
        
        if (!date || isNaN(date.getTime())) {
            setDateStr('Invalid date');
            setLocalDateStr('Invalid date');
            setRelativeTime('');
            setParsedDate(null);
            return;
        }

        setParsedDate(date);
        
        // Convert to source timezone
        const sourceDate = sourceTimezone === 'local' ? date : convertToTimezone(date, sourceTimezone);
        
        // Convert to target timezone
        const targetDate = targetTimezone === 'local' ? sourceDate : convertToTimezone(sourceDate, targetTimezone);
        
        const formatted = formatDate(targetDate, outputFormat, customOutputFormat);
        setDateStr(formatted);
        setLocalDateStr(targetDate.toLocaleString());
        setRelativeTime(calculateRelativeTime(date));
    };

    const handleDateChange = (val) => {
        setDateStr(val);
        
        const date = parseDateWithFormat(val, outputFormat);
        
        if (date && !isNaN(date.getTime())) {
            setParsedDate(date);
            const ts = Math.floor(date.getTime() / 1000);
            setTimestamp(ts.toString());
            setLocalDateStr(date.toLocaleString());
            setRelativeTime(calculateRelativeTime(date));
        }
    };

    const setNow = () => {
        const now = Math.floor(Date.now() / 1000);
        handleTsChange(now.toString());
    };

    const isValidTimestamp = timestamp && !isNaN(timestamp) && timestamp.length > 0;

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader 
                title="Unix Time Converter" 
                description="Convert between Unix timestamps and various date formats with timezone support." 
            />

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <TextInput
                            id="unix-ts"
                            labelText="Unix Timestamp or Date String"
                            value={timestamp}
                            onChange={(e) => handleTsChange(e.target.value)}
                            placeholder="Enter timestamp or date..."
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                    </div>
                    
                    <Button
                        size="md"
                        kind="primary"
                        onClick={setNow}
                        renderIcon={Time}
                    >
                        Now
                    </Button>
                </div>
            </ToolControls>

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.25rem'
                        }}>
                            Input Format
                        </label>
                        <Dropdown
                            id="input-format"
                            items={DATE_FORMATS}
                            itemToString={(item) => item ? item.label : ''}
                            selectedItem={DATE_FORMATS.find(f => f.id === inputFormat)}
                            onChange={({ selectedItem }) => {
                                if (selectedItem) {
                                    setInputFormat(selectedItem.id);
                                }
                            }}
                            size="sm"
                        />
                    </div>
                    
                    {inputFormat === 'custom' && (
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <TextInput
                                id="custom-input-format"
                                labelText="Custom Format"
                                value={customInputFormat}
                                onChange={(e) => setCustomInputFormat(e.target.value)}
                                placeholder="YYYY-MM-DD HH:mm:ss"
                                size="sm"
                            />
                        </div>
                    )}
                    
                    <div style={{ width: '200px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.25rem'
                        }}>
                            Source Timezone
                        </label>
                        <Dropdown
                            id="source-timezone"
                            items={TIMEZONES}
                            itemToString={(item) => item ? item.label : ''}
                            selectedItem={TIMEZONES.find(t => t.id === sourceTimezone)}
                            onChange={({ selectedItem }) => {
                                if (selectedItem) {
                                    setSourceTimezone(selectedItem.id);
                                    if (timestamp) handleTsChange(timestamp);
                                }
                            }}
                            size="sm"
                        />
                    </div>
                </div>
            </ToolControls>

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.25rem'
                        }}>
                            Output Format
                        </label>
                        <Dropdown
                            id="output-format"
                            items={DATE_FORMATS}
                            itemToString={(item) => item ? item.label : ''}
                            selectedItem={DATE_FORMATS.find(f => f.id === outputFormat)}
                            onChange={({ selectedItem }) => {
                                if (selectedItem) {
                                    setOutputFormat(selectedItem.id);
                                    if (timestamp) handleTsChange(timestamp);
                                }
                            }}
                            size="sm"
                        />
                    </div>
                    
                    {outputFormat === 'custom' && (
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <TextInput
                                id="custom-output-format"
                                labelText="Custom Format"
                                value={customOutputFormat}
                                onChange={(e) => setCustomOutputFormat(e.target.value)}
                                placeholder="YYYY-MM-DD HH:mm:ss"
                                size="sm"
                            />
                        </div>
                    )}
                    
                    <div style={{ width: '200px' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.25rem'
                        }}>
                            Target Timezone
                        </label>
                        <Dropdown
                            id="target-timezone"
                            items={TIMEZONES}
                            itemToString={(item) => item ? item.label : ''}
                            selectedItem={TIMEZONES.find(t => t.id === targetTimezone)}
                            onChange={({ selectedItem }) => {
                                if (selectedItem) {
                                    setTargetTimezone(selectedItem.id);
                                    if (timestamp) handleTsChange(timestamp);
                                }
                            }}
                            size="sm"
                        />
                    </div>
                </div>
            </ToolControls>

            {relativeTime && isValidTimestamp && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Tag type="blue">{relativeTime}</Tag>
                    <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                        from now
                    </span>
                </div>
            )}

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <ToolPane
                    label={`Formatted Date (${DATE_FORMATS.find(f => f.id === outputFormat)?.label || 'ISO'})`}
                    value={dateStr}
                    onChange={(e) => handleDateChange(e.target.value)}
                    placeholder="Formatted date will appear here..."
                />
                <ToolPane
                    label={`Local Date & Time (${targetTimezone === 'local' ? 'Local' : TIMEZONES.find(t => t.id === targetTimezone)?.label || 'Local'})`}
                    value={localDateStr}
                    readOnly
                    placeholder="Local date and time will appear here..."
                />
            </ToolSplitPane>
        </div>
    );
}
