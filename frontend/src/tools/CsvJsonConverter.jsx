import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CsvJsonConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('csv2json');
    const [error, setError] = useState('');

    const convert = () => {
        if (!input.trim()) { setOutput(''); return; }
        setError('');

        if (mode === 'csv2json') {
            Papa.parse(input, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setError('CSV Parse Error: ' + results.errors[0].message);
                    } else {
                        setOutput(JSON.stringify(results.data, null, 2));
                    }
                }
            });
        } else {
            try {
                const json = JSON.parse(input);
                const csv = Papa.unparse(json);
                setOutput(csv);
            } catch (e) {
                setError('Invalid JSON');
            }
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">CSV / JSON Converter</h2>
                <p className="tool-desc">Convert between CSV and JSON formats.</p>
            </div>

            <div className="controls">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'csv2json'} onChange={() => setMode('csv2json')} /> CSV to JSON
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'json2csv'} onChange={() => setMode('json2csv')} /> JSON to CSV
                    </label>
                </div>
                <button className="btn-primary" onClick={convert}>Convert</button>
            </div>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '10px' }}>{error}</div>}

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Input ({mode === 'csv2json' ? 'CSV' : 'JSON'})</span></div>
                    <textarea className="code-editor" value={input} onChange={(e) => setInput(e.target.value)} />
                </div>
                <div className="pane">
                    <div className="pane-header">
                        <span className="pane-label">Output ({mode === 'csv2json' ? 'JSON' : 'CSV'})</span>
                        <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
                    </div>
                    <textarea className="code-editor" readOnly value={output} />
                </div>
            </div>
        </div>
    );
}
