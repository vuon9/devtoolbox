import React, { useState } from 'react';

export default function BackslashEscaper() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('escape');

    const process = (val, currentMode) => {
        try {
            if (currentMode === 'escape') {
                setOutput(JSON.stringify(val).slice(1, -1));
            } else {
                // Unescape is tricky, standard JSON.parse can handle it if we wrap in quotes
                try {
                    setOutput(JSON.parse(`"${val}"`));
                } catch {
                    setOutput(val.replace(/\\(.)/g, "$1")); // Fallback simple unescape
                }
            }
        } catch (e) {
            setOutput('Error processing');
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Backslash Escape/Unescape</h2>
                <p className="tool-desc">Escape or unescape special characters.</p>
            </div>

            <div className="controls">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'escape'} onChange={() => { setMode('escape'); process(input, 'escape'); }} /> Escape
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'unescape'} onChange={() => { setMode('unescape'); process(input, 'unescape'); }} /> Unescape
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
