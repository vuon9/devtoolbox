import React, { useState, useEffect } from 'react';
import { Button, NumberInput, Checkbox } from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane } from '../components/ToolUI';

export default function RandomStringGenerator() {
    const [length, setLength] = useState(32);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(false);
    const [result, setResult] = useState('');

    const generate = () => {
        const u = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const l = "abcdefghijklmnopqrstuvwxyz";
        const n = "0123456789";
        const s = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        let chars = "";
        if (useUpper) chars += u;
        if (useLower) chars += l;
        if (useNumbers) chars += n;
        if (useSymbols) chars += s;

        if (!chars) {
            setResult('');
            return;
        }

        let res = "";
        const bytes = new Uint32Array(length);
        crypto.getRandomValues(bytes);

        for (let i = 0; i < length; i++) {
            res += chars[bytes[i] % chars.length];
        }
        setResult(res);
    };

    useEffect(() => {
        generate();
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    return (
        <div className="tool-container">
            <ToolHeader title="Random String Generator" description="Generate strong, random and secure strings." />

            <ToolControls>
                <NumberInput
                    id="length-input"
                    label="Length"
                    min={1}
                    max={2048}
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                />
                <Checkbox labelText="A-Z" id="use-upper" checked={useUpper} onChange={(_, { checked }) => setUseUpper(checked)} />
                <Checkbox labelText="a-z" id="use-lower" checked={useLower} onChange={(_, { checked }) => setUseLower(checked)} />
                <Checkbox labelText="0-9" id="use-numbers" checked={useNumbers} onChange={(_, { checked }) => setUseNumbers(checked)} />
                <Checkbox labelText="!@#$%" id="use-symbols" checked={useSymbols} onChange={(_, { checked }) => setUseSymbols(checked)} />
                <Button onClick={generate} renderIcon={Renew}>Generate</Button>
            </ToolControls>

            <ToolPane
                label="Result"
                value={result}
                readOnly
                placeholder="Generated string will appear here"
                style={{ height: 'auto' }}
            />
        </div>
    );
}
