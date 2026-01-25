import React, { useState } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function HexAsciiConverter() {
    const [hex, setHex] = useState('');
    const [ascii, setAscii] = useState('');

    const fromHex = (val) => {
        setHex(val);
        const clean = val.replace(/[^0-9a-fA-F]/g, '');
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
            <ToolHeader title="Hex / ASCII Converter" description="Convert between Hexadecimal strings and ASCII text." />

            <ToolSplitPane>
                <ToolPane
                    label="Hexadecimal"
                    value={hex}
                    onChange={(e) => fromHex(e.target.value)}
                    placeholder="48 65 6c 6c 6f..."
                />
                <ToolPane
                    label="ASCII"
                    value={ascii}
                    onChange={(e) => fromAscii(e.target.value)}
                    placeholder="Hello..."
                />
            </ToolSplitPane>
        </div>
    );
}
