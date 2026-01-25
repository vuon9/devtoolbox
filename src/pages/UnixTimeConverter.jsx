import React, { useState } from 'react';
import { Button, TextInput } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane } from '../components/ToolUI';

export default function UnixTimeConverter() {
    const [now] = useState(Math.floor(Date.now() / 1000));
    const [timestamp, setTimestamp] = useState(now);
    const [dateStr, setDateStr] = useState(new Date(now * 1000).toISOString());
    const [localDateStr, setLocalDateStr] = useState(new Date(now * 1000).toLocaleString());

    const handleTsChange = (val) => {
        setTimestamp(val);
        const d = new Date(val * 1000);
        setDateStr(d.toISOString());
        setLocalDateStr(d.toLocaleString());
    };

    const handleDateChange = (val) => {
        setDateStr(val);
        const ts = Math.floor(new Date(val).getTime() / 1000);
        if (!isNaN(ts)) {
            setTimestamp(ts);
            setLocalDateStr(new Date(val).toLocaleString());
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="Unix Time Converter" description="Convert Unix timestamps to human-readable dates." />

            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <ToolControls>
                    <div style={{ flex: 1 }}>
                        <TextInput
                            id="unix-ts"
                            labelText="Unix Timestamp (seconds)"
                            value={timestamp}
                            onChange={(e) => handleTsChange(e.target.value)}
                            type="number"
                        />
                    </div>
                    <Button
                        size="md"
                        kind="tertiary"
                        onClick={() => handleTsChange(Math.floor(Date.now() / 1000))}
                    >
                        Now
                    </Button>
                </ToolControls>

                {/* Reusing ToolPane for consistent copy behavior even for single line inputs if we treat them as panes or keep valid inputs here */}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* For single line outputs with copy, we can manually implement or wrap.
                         Let's just use ToolPane but with short height style override if we really want to enforce strictness,
                         or stick to Carbon TextInput + Copy Button pattern manually since these are single lines.
                         However, user asked for CONSISTENCY.
                         Let's keep the manual Carbon Input pattern for single lines but ensure the copy button is consistent.
                     */}
                </div>
            </div>

            {/* Since these are single line outputs, ToolPane might be overkill effectively acting as TextArea.
                 But user asked for consistency. Let's provide them as ReadOnly TextAreas for visual consistency with other tools?
                 Actually, typical Unix converters use inputs. I'll stick to Inputs but ensure they look good.
             */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxWidth: '600px' }}>
                <ToolPane
                    label="ISO 8601 Date"
                    value={dateStr}
                    onChange={(e) => handleDateChange(e.target.value)}
                    style={{ height: '80px' }} // Single line-ish
                />
                <ToolPane
                    label="Local Date"
                    value={localDateStr}
                    readOnly
                    style={{ height: '80px' }}
                />
            </div>
        </div>
    );
}
