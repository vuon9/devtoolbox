import React, { useState } from 'react';
import { serialize, unserialize } from 'php-serialize';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function PhpSerializer() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('unserialize');

    const process = (val, currentMode) => {
        setInput(val);
        if (!val.trim()) { setOutput(''); return; }
        try {
            if (currentMode === 'unserialize') {
                const obj = unserialize(val);
                setOutput(JSON.stringify(obj, null, 2));
            } else {
                const obj = JSON.parse(val);
                setOutput(serialize(obj));
            }
        } catch (e) {
            setOutput('Error: ' + e.message);
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="PHP Serializer" description="Serialize JSON to PHP format or Unserialize PHP strings to JSON." />

            <ToolControls>
                <RadioButtonGroup
                    legendText="Mode"
                    name="php-ser-mode-group"
                    defaultSelected="unserialize"
                    onChange={(val) => { setMode(val); process(input, val); }}
                    orientation="horizontal"
                >
                    <RadioButton labelText="Unserialize (PHP String -> JSON)" value="unserialize" id="radio-ser-1" />
                    <RadioButton labelText="Serialize (JSON -> PHP String)" value="serialize" id="radio-ser-2" />
                </RadioButtonGroup>
            </ToolControls>

            <ToolSplitPane>
                <ToolPane
                    label="Input"
                    value={input}
                    onChange={(e) => process(e.target.value, mode)}
                    placeholder={mode === 'unserialize' ? 'a:2:{s:3:"foo";s:3:"bar";...}' : '{"foo": "bar"}'}
                />
                <ToolPane
                    label="Output"
                    value={output}
                    readOnly
                />
            </ToolSplitPane>
        </div>
    );
}
