import React, { useState } from 'react';
import yaml from 'js-yaml';
import Papa from 'papaparse';
import { Select, SelectItem, Button, TextArea } from '@carbon/react';
import { ArrowRight, Copy } from '@carbon/icons-react';

// Basic PHP/JSON logic
const cheapPhpToJson = (phpStr) => {
    try {
        let s = phpStr.trim();
        if (s.startsWith('array(') && s.endsWith(')')) return "Not supported (Old syntax)";
        s = s.replace(/['"]?([\w\d_-]+)['"]?\s*=>/g, '"$1":');
        s = s.replace(/=>/g, ':');
        s = s.replace(/'/g, '"');
        s = s.replace(/,\s*]/g, ']');
        s = s.replace(/,\s*}/g, '}');
        const obj = JSON.parse(s);
        return JSON.stringify(obj, null, 2);
    } catch (e) { throw new Error("Parse Error"); }
}
const jsonToPhp = (jsonStr) => {
    const toPhp = (o, indent = '') => {
        if (typeof o === 'string') return `'${o.replace(/'/g, "\\'")}'`;
        if (typeof o === 'number' || typeof o === 'boolean' || o === null) return String(o);
        if (Array.isArray(o)) {
            const lines = o.map(v => `${indent}  ${toPhp(v, indent + '  ')},`);
            return `[\n${lines.join('\n')}\n${indent}]`;
        }
        if (typeof o === 'object') {
            const lines = Object.entries(o).map(([k, v]) => `${indent}  '${k}' => ${toPhp(v, indent + '  ')},`);
            return `[\n${lines.join('\n')}\n${indent}]`;
        }
    };
    return toPhp(JSON.parse(jsonStr));
}

export default function DataConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [sourceFmt, setSourceFmt] = useState('json');
    const [targetFmt, setTargetFmt] = useState('yaml');
    const [error, setError] = useState('');

    const formats = [
        { id: 'json', name: 'JSON' },
        { id: 'yaml', name: 'YAML' },
        { id: 'csv', name: 'CSV' },
        { id: 'php', name: 'PHP Array' },
    ];

    const convert = () => {
        if (!input.trim()) { setOutput(''); return; }
        setError('');

        try {
            // 1. Parse Source to JS Object
            let data;
            try {
                switch (sourceFmt) {
                    case 'json': data = JSON.parse(input); break;
                    case 'yaml': data = yaml.load(input); break;
                    case 'csv':
                        const csvRes = Papa.parse(input, { header: true, skipEmptyLines: true });
                        if (csvRes.errors.length) throw new Error(csvRes.errors[0].message);
                        data = csvRes.data;
                        break;
                    case 'php':
                        const res = cheapPhpToJson(input);
                        data = JSON.parse(res);
                        break;
                    default: throw new Error("Unknown source format");
                }
            } catch (e) { throw new Error(`Failed to parse ${sourceFmt.toUpperCase()}: ${e.message}`); }

            // 2. Stringify Object to Target
            let res = '';
            switch (targetFmt) {
                case 'json': res = JSON.stringify(data, null, 2); break;
                case 'yaml': res = yaml.dump(data); break;
                case 'csv': res = Papa.unparse(data); break;
                case 'php': res = jsonToPhp(JSON.stringify(data)); break;
                default: throw new Error("Unknown target format");
            }
            setOutput(res);

        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Data Converter</h2>
                <p className="tool-desc">Convert between JSON, YAML, CSV, and PHP Arrays.</p>
            </div>

            <div className="controls" style={{ alignItems: 'flex-end', gap: '1rem' }}>
                <Select
                    id="src-fmt"
                    labelText="From"
                    value={sourceFmt}
                    onChange={(e) => setSourceFmt(e.target.value)}
                    style={{ width: '150px' }}
                >
                    {formats.map(f => <SelectItem key={f.id} value={f.id} text={f.name} />)}
                </Select>

                <div style={{ paddingBottom: '0.5rem' }}>
                    <ArrowRight size={24} fill="var(--cds-text-secondary)" />
                </div>

                <Select
                    id="target-fmt"
                    labelText="To"
                    value={targetFmt}
                    onChange={(e) => setTargetFmt(e.target.value)}
                    style={{ width: '150px' }}
                >
                    {formats.map(f => <SelectItem key={f.id} value={f.id} text={f.name} />)}
                </Select>

                <Button onClick={convert}>Convert</Button>
            </div>
            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '10px' }}>{error}</div>}

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText={`${formats.find(f => f.id === sourceFmt).name} Input`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={20}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane">
                    <div style={{ position: 'relative', height: '100%' }}>
                        <TextArea
                            labelText={`${formats.find(f => f.id === targetFmt).name} Output`}
                            value={output}
                            readOnly
                            rows={20}
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
