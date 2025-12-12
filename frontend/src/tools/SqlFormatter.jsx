import React, { useState } from 'react';
import { format } from 'sql-formatter';

export default function SqlFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('sql');
    const [error, setError] = useState('');

    const handleFormat = () => {
        try {
            if (!input.trim()) return;
            const formatted = format(input, { language: language, tabWidth: 2, keywordCase: 'upper' });
            setOutput(formatted);
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">SQL Formatter</h2>
                <p className="tool-desc">Format and prettify SQL queries.</p>
            </div>

            <div className="controls">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '200px' }}>
                    <option value="sql">Standard SQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="bigquery">BigQuery</option>
                </select>
                <button className="btn-primary" onClick={handleFormat}>Format</button>
            </div>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '10px' }}>{error}</div>}

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Input</span></div>
                    <textarea className="code-editor" value={input} onChange={(e) => setInput(e.target.value)} />
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
