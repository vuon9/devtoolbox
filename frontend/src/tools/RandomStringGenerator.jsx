import React, { useState } from 'react';

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

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Random String Generator</h2>
                <p className="tool-desc">Generate random secure strings.</p>
            </div>

            <div className="controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label>Length:</label>
                    <input type="number" value={length} onChange={(e) => setLength(parseInt(e.target.value))} style={{ width: '60px' }} />
                </div>
                <label><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> A-Z</label>
                <label><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> a-z</label>
                <label><input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} /> 0-9</label>
                <label><input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> !@#</label>
                <button className="btn-primary" onClick={generate}>Generate</button>
            </div>

            <div className="pane" style={{ height: '200px' }}>
                <div className="pane-header">
                    <span className="pane-label">Result</span>
                    {result && <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>}
                </div>
                <textarea className="code-editor" readOnly value={result} style={{ fontSize: '1.2rem', textAlign: 'center', paddingTop: '60px' }} />
            </div>
        </div>
    );
}
