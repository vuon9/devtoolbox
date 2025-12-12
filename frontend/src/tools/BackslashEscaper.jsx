import React, { useState, useEffect } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function BackslashEscaper() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('escape');
    const [error, setError] = useState('');

    const process = (val, currentMode) => {
        try {
            let result;
            if (currentMode === 'escape') {
                result = JSON.stringify(val || '').slice(1, -1);
            } else {
                // Unescape is tricky, standard JSON.parse can handle it if we wrap in quotes
                try {
                    result = JSON.parse(`"${val || ''}"`);
                } catch {
                    result = (val || '').replace(/\\(.)/g, "$1"); // Fallback simple unescape
                }
            }
            setOutput(result);
            setError('');
        } catch (e) {
            setError('Error: ' + e.message);
            setOutput('');
        }
    };
    
    useEffect(() => {
        process(input, mode);
    }, [input, mode]);

    return (
        <div className="tool-container">
            <ToolHeader title="Backslash Escape/Unescape" description="Escape or unescape special characters in a string." />

            <ToolControls>
                <RadioButtonGroup
                    name="mode"
                    legendText="Mode"
                    value={mode}
                    onChange={setMode}
                    orientation="horizontal"
                >
                    <RadioButton labelText="Escape" value="escape" id="escape-radio" />
                    <RadioButton labelText="Unescape" value="unescape" id="unescape-radio" />
                </RadioButtonGroup>
            </ToolControls>

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label="Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste text here..."
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
