import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function YamlToJson() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('yaml2json'); // yaml2json | json2yaml
    const [error, setError] = useState('');

    useEffect(() => {
        const convert = () => {
            if (!input.trim()) {
                setOutput('');
                setError('');
                return;
            }

            try {
                if (mode === 'yaml2json') {
                    const obj = yaml.load(input);
                    setOutput(JSON.stringify(obj, null, 2));
                } else {
                    const obj = JSON.parse(input);
                    setOutput(yaml.dump(obj));
                }
                setError('');
            } catch (e) {
                setError(e.message);
                setOutput('');
            }
        };
        convert();
    }, [input, mode]);

    return (
        <div className="tool-container">
            <ToolHeader title="YAML / JSON Converter" description="Convert between YAML and JSON formats." />

            <ToolControls>
                <RadioButtonGroup
                    name="mode"
                    legendText="Conversion"
                    value={mode}
                    onChange={setMode}
                    orientation="horizontal"
                >
                    <RadioButton labelText="YAML to JSON" value="yaml2json" id="yaml2json-radio" />
                    <RadioButton labelText="JSON to YAML" value="json2yaml" id="json2yaml-radio" />
                </RadioButtonGroup>
            </ToolControls>

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label={mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'yaml2json' ? 'Enter YAML...' : 'Enter JSON...'}
                />
                <ToolPane
                    label={mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
