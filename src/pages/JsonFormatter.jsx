import React, { useState } from 'react';
import { Button, ButtonSet } from '@carbon/react';
import { Code, TrashCan } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);

    const format = () => {
        try {
            if (!input.trim()) { setOutput(''); return; }
            const obj = JSON.parse(input);
            setOutput(JSON.stringify(obj, null, 2));
            setError(null);
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    const minify = () => {
        try {
            if (!input.trim()) { setOutput(''); return; }
            const obj = JSON.parse(input);
            setOutput(JSON.stringify(obj));
            setError(null);
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="JSON Formatter" description="Pretty print or minify JSON data." />

            <ToolControls>
                <Button onClick={format} renderIcon={Code}>Format</Button>
                <Button onClick={minify} kind="secondary">Minify</Button>
                <Button onClick={() => { setInput(''); setOutput(''); setError(null); }} kind="ghost" renderIcon={TrashCan}>Clear</Button>
            </ToolControls>

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label="Input JSON"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste JSON here..."
                />
                <ToolPane
                    label="Output JSON"
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
