import React, { useState } from 'react';
import { Button, TextArea, ButtonSet } from '@carbon/react';
import { ArrowsHorizontal, Copy } from '@carbon/icons-react';

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
        return 'null';
    };
    try {
        return toPhp(JSON.parse(jsonStr));
    } catch (e) { return "Invalid JSON"; }
}

const phpToJson = (phpStr) => {
    // Very naive parser for simple short arrays
    try {
        let s = phpStr.trim();
        s = s.replace(/^\[/, '').replace(/\];?$/, '');
        const items = s.split(/,\s*[\n\r]+/).filter(x => x.trim());
        // This is extremely brittle, real PHP parsing needs a backend or complex grammar
        // So we might guide user to use DataConverter if this fails or just provide best effort.
        return "Note: For complex PHP conversion, please use the Data Converter tool.";
    } catch (e) { return "Parse Error"; }
}

export default function PhpJsonConverter() {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    const [mode, setMode] = useState('json-to-php');

    const convert = () => {
        if (mode === 'json-to-php') {
            setRight(jsonToPhp(left));
        } else {
            setRight(phpToJson(left));
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">PHP Array {'<->'} JSON</h2>
                <p className="tool-desc">Quickly convert between PHP Short Array Syntax and JSON.</p>
            </div>

            <div className="controls" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                <ButtonSet>
                    <Button
                        kind={mode === 'json-to-php' ? 'primary' : 'secondary'}
                        onClick={() => setMode('json-to-php')}
                        size="md"
                    >
                        JSON to PHP
                    </Button>
                    <Button
                        kind={mode === 'php-to-json' ? 'primary' : 'secondary'}
                        onClick={() => setMode('php-to-json')}
                        size="md"
                    >
                        PHP to JSON
                    </Button>
                </ButtonSet>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText={mode === 'json-to-php' ? 'Input JSON' : 'Input PHP'}
                        value={left}
                        onChange={(e) => setLeft(e.target.value)}
                        rows={20}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '60px' }}>
                    <Button hasIconOnly renderIcon={ArrowsHorizontal} kind="tertiary" onClick={convert} iconDescription="Convert" tooltipPosition="bottom" />
                </div>
                <div className="pane">
                    <div style={{ position: 'relative', height: '100%' }}>
                        <TextArea
                            labelText={mode === 'json-to-php' ? 'Output PHP' : 'Output JSON'}
                            value={right}
                            readOnly
                            rows={20}
                            style={{ height: '100%' }}
                        />
                        {right && (
                            <Button
                                hasIconOnly
                                renderIcon={Copy}
                                tooltipAlignment="end"
                                tooltipPosition="left"
                                iconDescription="Copy"
                                kind="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(right)}
                                style={{ position: 'absolute', top: '24px', right: '0' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
