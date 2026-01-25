import React, { useState } from 'react';
import { Button, ButtonSet } from '@carbon/react';
import { ArrowsHorizontal } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

const jsonToPhp = (jsonStr) => {
    const toPhp = (o, indent = '') => {
        if (typeof o === 'string') return `'${o.replace(/'/g, "\\'")}'`;
        if (typeof o === 'number' || typeof o === 'boolean' || o === null) return String(o);
        if (Array.isArray(o)) {
            const newIndent = indent + '  ';
            const lines = o.map(v => `${newIndent}${toPhp(v, newIndent)},`);
            return `[\n${lines.join('\n')}\n${indent}]`;
        }
        if (typeof o === 'object' && o !== null) {
            const newIndent = indent + '  ';
            const lines = Object.entries(o).map(([k, v]) => `${newIndent}'${k}' => ${toPhp(v, newIndent)},`);
            return `[\n${lines.join('\n')}\n${indent}]`;
        }
        return 'null';
    };
    try {
        const parsed = JSON.parse(jsonStr);
        return toPhp(parsed);
    } catch (e) { return "Invalid JSON: " + e.message; }
};

const phpToJson = (phpStr) => {
    // This is a placeholder as PHP parsing is too complex for the frontend.
    // We guide the user to a more powerful tool if needed.
    return "Note: For complex PHP-to-JSON conversion, please use the Data Converter tool which leverages a backend service.";
};

export default function PhpJsonConverter() {
    const [left, setLeft] = useState('{\n  "hello": "world"\n}');
    const [right, setRight] = useState('');
    const [mode, setMode] = useState('json-to-php');

    const convert = () => {
        if (mode === 'json-to-php') {
            setRight(jsonToPhp(left));
        } else {
            setRight(phpToJson(left));
        }
    };
    
    const swap = () => {
        const newMode = mode === 'json-to-php' ? 'php-to-json' : 'json-to-php';
        setMode(newMode);
        setLeft(right);
        setRight(left);
    }

    return (
        <div className="tool-container">
            <ToolHeader title="PHP Array <-> JSON" description="Quickly convert between PHP Short Array Syntax and JSON." />

            <ToolControls>
                <ButtonSet>
                    <Button kind={mode === 'json-to-php' ? 'primary' : 'secondary'} onClick={() => setMode('json-to-php')}>
                        JSON to PHP
                    </Button>
                    <Button kind={mode === 'php-to-json' ? 'primary' : 'secondary'} onClick={() => setMode('php-to-json')}>
                        PHP to JSON
                    </Button>
                </ButtonSet>
                <Button onClick={convert}>Convert</Button>
                <Button hasIconOnly renderIcon={ArrowsHorizontal} onClick={swap} kind="ghost" iconDescription="Swap" tooltipPosition="bottom" />
            </ToolControls>

            <ToolSplitPane>
                <ToolPane
                    label={mode === 'json-to-php' ? 'Input JSON' : 'Input PHP'}
                    value={left}
                    onChange={(e) => setLeft(e.target.value)}
                />
                <ToolPane
                    label={mode === 'json-to-php' ? 'Output PHP' : 'Output JSON'}
                    value={right}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
