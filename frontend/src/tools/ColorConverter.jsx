import React, { useState, useCallback } from 'react';
import { TextInput } from '@carbon/react';
import { ToolHeader, ToolControls } from '../components/ToolUI';

// Basic color conversion utilities
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
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
};

export default function ColorConverter() {
    const [hex, setHex] = useState('#ffffff');
    const [rgb, setRgb] = useState('rgb(255, 255, 255)');
    const [hsl, setHsl] = useState('hsl(0, 0%, 100%)');
    const [error, setError] = useState('');

    const handleHexChange = useCallback((val) => {
        setHex(val);
        const trimmedVal = val.trim();
        if (/^#[0-9A-F]{6}$/i.test(trimmedVal) || /^[0-9A-F]{6}$/i.test(trimmedVal)) {
            const hexVal = trimmedVal.startsWith('#') ? trimmedVal : `#${trimmedVal}`;
            const rgbVal = hexToRgb(hexVal);
            if (rgbVal) {
                setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
                setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
                setError('');
            }
        } else {
            setError('Invalid HEX color format. Use #RRGGBB.');
        }
    }, []);

    return (
        <div className="tool-container">
            <ToolHeader title="Color Converter" description="Convert between HEX, RGB, and HSL color formats." />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div 
                    style={{ 
                        width: '72px', 
                        height: '72px', 
                        backgroundColor: error ? 'transparent' : hex, 
                        border: '1px solid var(--cds-border-strong)',
                        borderRadius: '4px'
                    }} 
                />
                <div style={{flex: 1}}>
                    <ToolControls style={{ marginBottom: 0 }}>
                        <TextInput
                            id="hex-input"
                            labelText="HEX Input"
                            value={hex}
                            onChange={(e) => handleHexChange(e.target.value)}
                            invalid={!!error}
                            invalidText={error}
                        />
                    </ToolControls>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TextInput
                    id="rgb-output"
                    labelText="RGB"
                    value={rgb}
                    readOnly
                />
                <TextInput
                    id="hsl-output"
                    labelText="HSL"
                    value={hsl}
                    readOnly
                />
            </div>
        </div>
    );
}
