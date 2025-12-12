import React, { useState } from 'react';
import { TextArea, Checkbox, Button } from '@carbon/react';
import { Copy, DataEnrichment } from '@carbon/icons-react';

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
            lines.sort((a, b) => {
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
        }

        if (options.reverse) {
            lines.reverse();
        }

        setOutput(lines.join('\n'));
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Line Sort / Dedupe</h2>
                <p className="tool-desc">Sort, deduplicate, and clean up lists of text.</p>
            </div>

            <div className="controls" style={{ flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <Checkbox
                    labelText="Sort"
                    id="chk-sort"
                    checked={options.sort}
                    onChange={(e, { checked }) => setOptions({ ...options, sort: checked })}
                />
                <Checkbox
                    labelText="Deduplicate"
                    id="chk-dedupe"
                    checked={options.dedupe}
                    onChange={(e, { checked }) => setOptions({ ...options, dedupe: checked })}
                />
                <Checkbox
                    labelText="Reverse"
                    id="chk-reverse"
                    checked={options.reverse}
                    onChange={(e, { checked }) => setOptions({ ...options, reverse: checked })}
                />
                <Checkbox
                    labelText="Trim Lines"
                    id="chk-trim"
                    checked={options.trim}
                    onChange={(e, { checked }) => setOptions({ ...options, trim: checked })}
                />
                <Checkbox
                    labelText="Remove Empty"
                    id="chk-empty"
                    checked={options.ignoreEmpty}
                    onChange={(e, { checked }) => setOptions({ ...options, ignoreEmpty: checked })}
                />

                <div style={{ marginLeft: 'auto' }}>
                    <Button onClick={process} renderIcon={DataEnrichment}>Process</Button>
                </div>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText="Input List"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter lines..."
                        rows={20}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane">
                    <div style={{ position: 'relative', height: '100%' }}>
                        <TextArea
                            labelText="Cleaned Output"
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
