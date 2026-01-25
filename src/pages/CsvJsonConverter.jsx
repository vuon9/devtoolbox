import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button, RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function CsvJsonConverter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('csv2json');
    const [error, setError] = useState('');

    const convert = () => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }
        setError('');

        if (mode === 'csv2json') {
            Papa.parse(input, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setError('CSV Parse Error: ' + results.errors[0].message);
                        setOutput('');
                    } else {
                        setOutput(JSON.stringify(results.data, null, 2));
                    }
                },
                error: (err) => {
                    setError('CSV Parse Error: ' + err.message);
                    setOutput('');
                }
            });
        } else {
            try {
                const json = JSON.parse(input);
                const csv = Papa.unparse(json);
                setOutput(csv);
            } catch (e) {
                setError('Invalid JSON: ' + e.message);
                setOutput('');
            }
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="CSV / JSON Converter" description="Convert between CSV and JSON formats." />

            <ToolControls>
                <RadioButtonGroup
                    name="mode"
                    legendText="Conversion Mode"
                    value={mode}
                    onChange={setMode}
                    orientation="horizontal"
                >
                    <RadioButton labelText="CSV to JSON" value="csv2json" id="csv2json-radio" />
                    <RadioButton labelText="JSON to CSV" value="json2csv" id="json2csv-radio" />
                </RadioButtonGroup>
                <Button onClick={convert}>Convert</Button>
            </ToolControls>

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label={`Input (${mode === 'csv2json' ? 'CSV' : 'JSON'})`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <ToolPane
                    label={`Output (${mode === 'csv2json' ? 'JSON' : 'CSV'})`}
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
