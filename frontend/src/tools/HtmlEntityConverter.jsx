import React, { useState, useEffect } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function HtmlEntityConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');
    const [error, setError] = useState('');

    const process = (val, currentMode) => {
        try {
            let result;
            if (currentMode === 'encode') {
                result = (val || '').replace(/[\u00A0-\u9999<>&]/g, (i) => '&#' + i.charCodeAt(0) + ';');
            } else {
                const doc = new DOMParser().parseFromString(val || '', "text/html");
                result = doc.documentElement.textContent;
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
            <ToolHeader title="HTML Entity Converter" description="Encode or decode HTML entities." />

            <ToolControls>
                <RadioButtonGroup
                    name="mode"
                    legendText="Mode"
                    value={mode}
                    onChange={setMode}
                    orientation="horizontal"
                >
                    <RadioButton labelText="Encode" value="encode" id="encode-radio" />
                    <RadioButton labelText="Decode" value="decode" id="decode-radio" />
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
