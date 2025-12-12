import React, { useState } from 'react';

export default function HtmlEntityConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');

    const process = (val, currentMode) => {
        try {
            if (currentMode === 'encode') {
                setOutput(val.replace(/[\u00A0-\u9999<>&]/g, function (i) {
                    return '&#' + i.charCodeAt(0) + ';';
                }));
            } else {
                const doc = new DOMParser().parseFromString(val, "text/html");
                setOutput(doc.documentElement.textContent);
            }
        } catch (e) {
            setOutput('Error processing');
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">HTML Entity Converter</h2>
                <p className="tool-desc">Encode or decode HTML entities.</p>
            </div>

            <div className="controls">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'encode'} onChange={() => { setMode('encode'); process(input, 'encode'); }} /> Encode
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'decode'} onChange={() => { setMode('decode'); process(input, 'decode'); }} /> Decode
                    </label>
                </div>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Input</span></div>
                    <textarea className="code-editor" value={input} onChange={(e) => { setInput(e.target.value); process(e.target.value, mode) }} />
                </div>
                <div className="pane">
                    <div className="pane-header">
                        <span className="pane-label">Output</span>
                        <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
                    </div>
                    <textarea className="code-editor" readOnly value={output} />
                </div>
            </div>
        </div>
    );
}
