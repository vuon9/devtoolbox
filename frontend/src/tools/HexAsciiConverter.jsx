import React, { useState } from 'react';
import { TextArea } from '@carbon/react';

export default function HexAsciiConverter() {
    const [hex, setHex] = useState('');
    const [ascii, setAscii] = useState('');

    const fromHex = (val) => {
        setHex(val);
        const clean = val.replace(/\s/g, '');
        let str = '';
        for (let i = 0; i < clean.length; i += 2) {
            str += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
        }
        setAscii(str);
    };

    const fromAscii = (val) => {
        setAscii(val);
        let str = '';
        for (let i = 0; i < val.length; i++) {
            str += val.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
        }
        setHex(str.trim());
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Hex / ASCII Converter</h2>
                <p className="tool-desc">Convert between Hexadecimal strings and ASCII text.</p>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText="Hexadecimal"
                        value={hex}
                        onChange={(e) => fromHex(e.target.value)}
                        placeholder="48 65 6c 6c 6f..."
                        rows={15}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane">
                    <TextArea
                        labelText="ASCII"
                        value={ascii}
                        onChange={(e) => fromAscii(e.target.value)}
                        placeholder="Hello..."
                        rows={15}
                        style={{ height: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}
