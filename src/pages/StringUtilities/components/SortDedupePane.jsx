import React, { useState, useEffect } from 'react';
import { Checkbox } from '@carbon/react';
import { ToolControls, ToolPane, ToolSplitPane } from '../../../components/ToolUI';

export default function SortDedupePane({ input, setInput, layout }) {
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
            if (!input) {
                setOutput('');
                return;
            }

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
        <>
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

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <ToolPane
                    label="Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter lines to process..."
                />
                <ToolPane
                    label="Processed Output"
                    value={output}
                    readOnly
                    placeholder="Processed result will appear here..."
                />
            </ToolSplitPane>
        </>
    );
}
