import React, { useState } from 'react';
import { TextArea, RadioButtonGroup, RadioButton, Button } from '@carbon/react';
import { Copy } from '@carbon/icons-react';

export default function UrlEncoder() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');

    const process = (val, currentMode) => {
        setInput(val);
        if (!val) { setOutput(''); return; }
        try {
            if (currentMode === 'encode') {
                setOutput(encodeURIComponent(val));
            } else {
                setOutput(decodeURIComponent(val));
            }
        } catch (e) {
            setOutput('Error: ' + e.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <RadioButtonGroup
                legendText="Mode"
                name="url-mode-group"
                defaultSelected="encode"
                onChange={(val) => { setMode(val); process(input, val); }}
                orientation="horizontal"
            >
                <RadioButton labelText="Encode" value="encode" id="url-radio-1" />
                <RadioButton labelText="Decode" value="decode" id="url-radio-2" />
            </RadioButtonGroup>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText="Input"
                        value={input}
                        onChange={(e) => process(e.target.value, mode)}
                        placeholder={mode === 'encode' ? "Text to encode..." : "URL to decode..."}
                        rows={15}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane">
                    <div style={{ position: 'relative', height: '100%' }}>
                        <TextArea
                            labelText="Output"
                            value={output}
                            readOnly
                            rows={15}
                            style={{ height: '100%' }}
                        />
                        {output && (
                            <Button
                                hasIconOnly
                                renderIcon={Copy}
                                tooltipAlignment="end"
                                tooltipPosition="left"
                                iconDescription="Copy"
                                kind="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(output)}
                                style={{ position: 'absolute', top: '24px', right: '0' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
