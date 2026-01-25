import React, { useState, useEffect } from 'react';
import { Checkbox, Button } from '@carbon/react';
import { DataEnrichment } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function LineSortDedupe() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [options, setOptions] = useState({
        sort: true,
        dedupe: true,
        reverse: false,
        trim: true,
        ignoreEmpty: true
    });

    useEffect(() => {
        const process = () => {
            let lines = input.split('\n');

            if (options.trim) {
                lines = lines.map(l => l.trim());
            }

            if (options.ignoreEmpty) {
                lines = lines.filter(l => l !== '');
            }

            if (options.dedupe) {
                lines = [...new Set(lines)];
            }

            if (options.sort) {
                lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            }

            if (options.reverse) {
                lines.reverse();
            }

            setOutput(lines.join('\n'));
        };
        process();
    }, [input, options]);


    return (
        <div className="tool-container">
            <ToolHeader title="Line Sort / Dedupe" description="Sort, deduplicate, and clean up lists of text." />

            <ToolControls>
                <Checkbox
                    labelText="Sort"
                    id="chk-sort"
                    checked={options.sort}
                    onChange={(_, { checked }) => setOptions({ ...options, sort: checked })}
                />
                <Checkbox
                    labelText="Deduplicate"
                    id="chk-dedupe"
                    checked={options.dedupe}
                    onChange={(_, { checked }) => setOptions({ ...options, dedupe: checked })}
                />
                <Checkbox
                    labelText="Reverse"
                    id="chk-reverse"
                    checked={options.reverse}
                    onChange={(_, { checked }) => setOptions({ ...options, reverse: checked })}
                />
                <Checkbox
                    labelText="Trim Lines"
                    id="chk-trim"
                    checked={options.trim}
                    onChange={(_, { checked }) => setOptions({ ...options, trim: checked })}
                />
                <Checkbox
                    labelText="Remove Empty"
                    id="chk-empty"
                    checked={options.ignoreEmpty}
                    onChange={(_, { checked }) => setOptions({ ...options, ignoreEmpty: checked })}
                />
            </ToolControls>

            <ToolSplitPane>
                <ToolPane
                    label="Input List"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter lines..."
                />
                <ToolPane
                    label="Cleaned Output"
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
