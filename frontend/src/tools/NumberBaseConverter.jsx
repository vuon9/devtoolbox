import React, { useState } from 'react';

export default function NumberBaseConverter() {
    const [dec, setDec] = useState('');
    const [hex, setHex] = useState('');
    const [oct, setOct] = useState('');
    const [bin, setBin] = useState('');

    const updateFromDec = (val) => {
        setDec(val);
        if (val === '') { reset(); return; }
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        setHex(num.toString(16).toUpperCase());
        setOct(num.toString(8));
        setBin(num.toString(2));
    };

    const updateFromHex = (val) => {
        setHex(val);
        if (val === '') { reset(); return; }
        const num = parseInt(val, 16);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setOct(num.toString(8));
        setBin(num.toString(2));
    };

    const updateFromOct = (val) => {
        setOct(val);
        if (val === '') { reset(); return; }
        const num = parseInt(val, 8);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setHex(num.toString(16).toUpperCase());
        setBin(num.toString(2));
    };

    const updateFromBin = (val) => {
        setBin(val);
        if (val === '') { reset(); return; }
        const num = parseInt(val, 2);
        if (isNaN(num)) return;
        setDec(num.toString(10));
        setHex(num.toString(16).toUpperCase());
        setOct(num.toString(8));
    };

    const reset = () => {
        setDec('');
        setHex('');
        setOct('');
        setBin('');
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Number Base Converter</h2>
                <p className="tool-desc">Convert numbers between Decimal, Hexadecimal, Octal, and Binary.</p>
            </div>

            <div className="pane" style={{ maxWidth: '600px', gap: '20px' }}>
                <div>
                    <div className="pane-header"><span className="pane-label">Decimal</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} value={dec} onChange={(e) => updateFromDec(e.target.value)} type="number" />
                </div>
                <div>
                    <div className="pane-header"><span className="pane-label">Hexadecimal</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} value={hex} onChange={(e) => updateFromHex(e.target.value)} />
                </div>
                <div>
                    <div className="pane-header"><span className="pane-label">Octal</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} value={oct} onChange={(e) => updateFromOct(e.target.value)} type="number" />
                </div>
                <div>
                    <div className="pane-header"><span className="pane-label">Binary</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} value={bin} onChange={(e) => updateFromBin(e.target.value)} type="number" />
                </div>
            </div>
        </div>
    );
}
