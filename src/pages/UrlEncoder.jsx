import React, { useState, useEffect } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function UrlEncoder() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');
    const [error, setError] = useState('');

    useEffect(() => {
        const process = () => {
            if (!input) {
                setOutput('');
                setError('');
                return;
            }
            try {
                if (mode === 'encode') {
                    setOutput(encodeURIComponent(input));
                } else {
                    setOutput(decodeURIComponent(input));
                }
                setError('');
            } catch (e) {
                setOutput('');
                setError('Error: ' + e.message);
            }
        };
        process();
    }, [input, mode]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <ToolControls>
                <RadioButtonGroup
                    legendText="Mode"
                    name="url-mode-group"
                    value={mode}
                    onChange={setMode}
                    orientation="horizontal"
                >
                    <RadioButton labelText="Encode" value="encode" id="url-radio-1" />
                    <RadioButton labelText="Decode" value="decode" id="url-radio-2" />
                </RadioButtonGroup>
            </ToolControls>

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label="Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'encode' ? "Text to encode..." : "URL to decode..."}
                />
                <ToolPane
                    label="Output"
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
