import React, { useState } from 'react';
import yaml from 'js-yaml';

export default function YamlToJson() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('yaml2json'); // yaml2json | json2yaml
    const [error, setError] = useState('');

    const convert = (val, currentMode) => {
        if (!val.trim()) {
            setOutput('');
            setError('');
            return;
        }

        try {
            if (currentMode === 'yaml2json') {
                const obj = yaml.load(val);
                setOutput(JSON.stringify(obj, null, 2));
            } else {
                const obj = JSON.parse(val);
                setOutput(yaml.dump(obj));
            }
            setError('');
        } catch (e) {
            setError(e.message);
            setOutput('');
        }
    };

    const handleInput = (val) => {
        setInput(val);
        convert(val, mode);
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">YAML / JSON Converter</h2>
                <p className="tool-desc">Convert between YAML and JSON formats.</p>
            </div>

            <div className="controls">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'yaml2json'} onChange={() => { setMode('yaml2json'); convert(input, 'yaml2json'); }} /> YAML to JSON
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={mode === 'json2yaml'} onChange={() => { setMode('json2yaml'); convert(input, 'json2yaml'); }} /> JSON to YAML
                    </label>
                </div>
            </div>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '10px' }}>{error}</div>}

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">{mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}</span></div>
                    <textarea className="code-editor" value={input} onChange={(e) => handleInput(e.target.value)} />
                </div>
                <div className="pane">
                    <div className="pane-header">
                        <span className="pane-label">{mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}</span>
                        <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
                    </div>
                    <textarea className="code-editor" readOnly value={output} />
                </div>
            </div>
        </div>
    );
}
