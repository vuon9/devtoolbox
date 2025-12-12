import React, { useState, useEffect } from 'react';

export default function ColorConverter() {
    const [hex, setHex] = useState('#ffffff');
    const [rgb, setRgb] = useState('rgb(255, 255, 255)');
    const [hsl, setHsl] = useState('hsl(0, 0%, 100%)');

    // Very basic implementation, syncing is tricky without a library like tinycolor2
    // I'll stick to HEX as master for simplicity or try to parse inputs.
    // Let's make HEX main input for now.

    const hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    const handleHexChange = (val) => {
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            const rgbVal = hexToRgb(val);
            if (rgbVal) {
                setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
                setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
            }
        }
    };

    // Only allow changing HEX for this simple version to avoid loops

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Color Converter</h2>
                <p className="tool-desc">Convert between HEX, RGB, and HSL formats.</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: hex, borderRadius: '10px', border: '1px solid var(--border-color)' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="pane-header"><span className="pane-label">HEX</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} value={hex} onChange={(e) => handleHexChange(e.target.value)} />

                    <div className="pane-header"><span className="pane-label">RGB</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} readOnly value={rgb} />

                    <div className="pane-header"><span className="pane-label">HSL</span></div>
                    <input className="code-editor" style={{ height: 'auto' }} readOnly value={hsl} />
                </div>
            </div>
        </div>
    );
}
