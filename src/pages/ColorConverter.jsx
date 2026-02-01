import React, { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import { Button, TextInput, Tile, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Eyedropper, Copy, ColorPalette, TrashCan } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolLayoutToggle } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

// Color utility functions
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex) ||
                   /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (!result) return null;
    
    const r = parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16);
    const g = parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16);
    const b = parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16);
    const a = result[4] ? parseInt(result[4].length === 1 ? result[4] + result[4] : result[4], 16) / 255 : 1;
    
    return { r, g, b, a };
};

const rgbToHex = (r, g, b, a = 1) => {
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (a < 1) {
        return `${hex}${toHex(a * 255)}`;
    }
    return hex;
};

const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;
    
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
};

const rgbToCmyk = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
};

// Generate code snippets for various languages
const generateCodeSnippets = (r, g, b, a, hsl, hsv) => {
    const rf = (r / 255).toFixed(3);
    const gf = (g / 255).toFixed(3);
    const bf = (b / 255).toFixed(3);
    const af = a.toFixed(2);
    const hue = hsl.h;
    const sat = hsv.s;
    const bright = hsv.v;
    
    return {
        css: [
            { name: 'RGB', code: `rgb(${r} ${g} ${b})` },
            { name: 'RGBA', code: `rgb(${r} ${g} ${b} / ${Math.round(a * 100)}%)` },
            { name: 'HSL', code: `hsl(${hue}deg ${hsl.s}% ${hsl.l}%)` },
            { name: 'HSLA', code: `hsl(${hue}deg ${hsl.s}% ${hsl.l}% / ${Math.round(a * 100)}%)` },
            { name: 'Hex', code: rgbToHex(r, g, b, a) },
            { name: 'CSS Variable', code: `--color-primary: ${rgbToHex(r, g, b, a)};` }
        ],
        swift: [
            { name: 'NSColor RGB', code: `NSColor(
    calibratedRed: ${rf},
    green: ${gf},
    blue: ${bf},
    alpha: ${af}
)` },
            { name: 'NSColor HSB', code: `NSColor(
    calibratedHue: ${hue / 360},
    saturation: ${(sat / 100).toFixed(3)},
    brightness: ${(bright / 100).toFixed(3)},
    alpha: ${af}
)` },
            { name: 'UIColor RGB', code: `UIColor(
    red: ${rf},
    green: ${gf},
    blue: ${bf},
    alpha: ${af}
)` },
            { name: 'UIColor HSB', code: `UIColor(
    hue: ${hue / 360},
    saturation: ${(sat / 100).toFixed(3)},
    brightness: ${(bright / 100).toFixed(3)},
    alpha: ${af}
)` }
        ],
        dotnet: [
            { name: 'FromRgb', code: `Color.FromRgb(${r}, ${g}, ${b})` },
            { name: 'FromArgb', code: `Color.FromArgb(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
            { name: 'FromHex', code: `Color.FromHex("${rgbToHex(r, g, b).replace('#', '')}")` }
        ],
        java: [
            { name: 'Color RGB', code: `new Color(${r}, ${g}, ${b})` },
            { name: 'Color RGBA', code: `new Color(${r}, ${g}, ${b}, ${Math.round(a * 255)})` },
            { name: 'Color HSB', code: `Color.getHSBColor(${hue / 360}f, ${(sat / 100).toFixed(3)}f, ${(bright / 100).toFixed(3)}f)` }
        ],
        android: [
            { name: 'Color.rgb', code: `Color.rgb(${r}, ${g}, ${b})` },
            { name: 'Color.argb', code: `Color.argb(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
            { name: 'Color.parseColor', code: `Color.parseColor("${rgbToHex(r, g, b)}")` },
            { name: 'Resource', code: `<color name="custom_color">${rgbToHex(r, g, b)}</color>` },
            { name: 'Resource with Alpha', code: `<color name="custom_color">${rgbToHex(r, g, b, a)}</color>` }
        ],
        opengl: [
            { name: 'glColor3f', code: `glColor3f(${rf}f, ${gf}f, ${bf}f)` },
            { name: 'glColor4f', code: `glColor4f(${rf}f, ${gf}f, ${bf}f, ${af}f)` },
            { name: 'glColor3ub', code: `glColor3ub(${r}, ${g}, ${b})` },
            { name: 'glColor4ub', code: `glColor4ub(${r}, ${g}, ${b}, ${Math.round(a * 255)})` }
        ],
        objc: [
            { name: 'UIColor RGB', code: `[UIColor colorWithRed:${rf} green:${gf} blue:${bf} alpha:${af}]` },
            { name: 'UIColor HSB', code: `[UIColor colorWithHue:${(hue / 360).toFixed(3)} saturation:${(sat / 100).toFixed(3)} brightness:${(bright / 100).toFixed(3)} alpha:${af}]` },
            { name: 'NSColor RGB', code: `[[NSColor colorWithCalibratedRed:${rf} green:${gf} blue:${bf} alpha:${af}]` }
        ],
        flutter: [
            { name: 'Color from RGB', code: `Color.fromRGBO(${r}, ${g}, ${b}, ${af})` },
            { name: 'Color from ARGB', code: `Color.fromARGB(${Math.round(a * 255)}, ${r}, ${g}, ${b})` },
            { name: 'Color hex', code: `Color(0xFF${rgbToHex(r, g, b).replace('#', '').toUpperCase()})` },
            { name: 'Color hex with alpha', code: `Color(0x${Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase()}${rgbToHex(r, g, b).replace('#', '').toUpperCase()})` }
        ],
        unity: [
            { name: 'Color', code: `new Color(${rf}f, ${gf}f, ${bf}f, ${af}f)` },
            { name: 'Color32', code: `new Color32(${r}, ${g}, ${b}, ${Math.round(a * 255)})` },
            { name: 'Hex String', code: `ColorUtility.TryParseHtmlString("${rgbToHex(r, g, b)}", out Color color)` }
        ],
        reactnative: [
            { name: 'StyleSheet', code: `const styles = StyleSheet.create({
    container: {
        backgroundColor: '${rgbToHex(r, g, b)}',
    },
});` },
            { name: 'Inline', code: `{ backgroundColor: '${rgbToHex(r, g, b)}' }` },
            { name: 'RGBA', code: `{ backgroundColor: 'rgba(${r}, ${g}, ${b}, ${af})' }` }
        ],
        svg: [
            { name: 'Fill', code: `fill="${rgbToHex(r, g, b)}"` },
            { name: 'Stroke', code: `stroke="${rgbToHex(r, g, b)}"` },
            { name: 'Fill with Opacity', code: `fill="${rgbToHex(r, g, b)}" fill-opacity="${af}"` }
        ]
    };
};

// Initial state
const initialState = {
    hex: '#3DD6F5',
    rgb: { r: 61, g: 214, b: 245, a: 1 },
    hsl: { h: 191, s: 90, l: 60 },
    hsv: { h: 191, s: 75, v: 96 },
    cmyk: { c: 75, m: 13, y: 0, k: 4 },
    history: [],
    selectedTab: 0
};

// Reducer for state management
function colorReducer(state, action) {
    switch (action.type) {
        case 'SET_COLOR':
            return {
                ...state,
                ...action.payload
            };
        case 'ADD_TO_HISTORY':
            const newEntry = action.payload;
            if (state.history.some(h => h.hex === newEntry.hex)) {
                return state;
            }
            return {
                ...state,
                history: [newEntry, ...state.history].slice(0, 10)
            };
        case 'SET_SELECTED_TAB':
            return { ...state, selectedTab: action.payload };
        case 'CLEAR_HISTORY':
            return { ...state, history: [] };
        case 'LOAD_FROM_HISTORY':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

export default function ColorConverter() {
    const [state, dispatch] = useReducer(colorReducer, initialState);
    const [hexInput, setHexInput] = useState(initialState.hex);
    const [isHexValid, setIsHexValid] = useState(true);
    const [rgbInputs, setRgbInputs] = useState(initialState.rgb);
    const [hslInputs, setHslInputs] = useState(initialState.hsl);
    const [eyedropperSupported, setEyedropperSupported] = useState(false);
    const [isPicking, setIsPicking] = useState(false);
    const historyTimeoutRef = useRef(null);

    // Layout toggle support
    const layout = useLayoutToggle({
        toolKey: 'color-converter-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Check for EyeDropper API support
    useEffect(() => {
        setEyedropperSupported('EyeDropper' in window);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (historyTimeoutRef.current) {
                clearTimeout(historyTimeoutRef.current);
            }
        };
    }, []);

    // Generate code snippets when color changes
    const codeSnippets = useMemo(() => 
        generateCodeSnippets(
            state.rgb.r, state.rgb.g, state.rgb.b, state.rgb.a,
            state.hsl, state.hsv
        ),
        [state.rgb, state.hsl, state.hsv]
    );

    // Debounced history recording
    const debouncedAddToHistory = useCallback((hex, rgb) => {
        // Clear existing timeout
        if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
        }
        // Set new timeout to add to history after 100ms of no changes
        historyTimeoutRef.current = setTimeout(() => {
            dispatch({
                type: 'ADD_TO_HISTORY',
                payload: { hex, rgb }
            });
        }, 100);
    }, []);

    // Update all color formats from RGB
    const updateFromRgb = useCallback((r, g, b, a = 1) => {
        const hex = rgbToHex(r, g, b, a);
        const hsl = rgbToHsl(r, g, b);
        const hsv = rgbToHsv(r, g, b);
        const cmyk = rgbToCmyk(r, g, b);
        
        dispatch({
            type: 'SET_COLOR',
            payload: { hex, rgb: { r, g, b, a }, hsl, hsv, cmyk }
        });
        setHexInput(hex);
        setRgbInputs({ r, g, b, a });
        setHslInputs(hsl);
        
        // Debounce history recording
        debouncedAddToHistory(hex, { r, g, b, a });
    }, [debouncedAddToHistory]);

    // Handle hex input change
    const handleHexChange = useCallback((value) => {
        setHexInput(value);
        const rgb = hexToRgb(value);
        if (rgb) {
            setIsHexValid(true);
            updateFromRgb(rgb.r, rgb.g, rgb.b, rgb.a);
        } else {
            setIsHexValid(false);
        }
    }, [updateFromRgb]);

    // Handle hex input blur - validate and reset if invalid
    const handleHexBlur = useCallback(() => {
        const rgb = hexToRgb(hexInput);
        if (!rgb) {
            // Reset to current valid color
            setHexInput(state.hex);
            setIsHexValid(true);
        }
    }, [hexInput, state.hex]);

    // Handle RGB input changes
    const handleRgbChange = useCallback((key, value) => {
        const numValue = key === 'a'
            ? parseFloat(value) || 0  // Preserve decimal for alpha
            : parseInt(value, 10) || 0;
        const newRgb = { ...rgbInputs, [key]: numValue };
        setRgbInputs(newRgb);

        if (key === 'a') {
            updateFromRgb(newRgb.r, newRgb.g, newRgb.b, numValue);
        } else {
            updateFromRgb(newRgb.r, newRgb.g, newRgb.b, newRgb.a);
        }
    }, [rgbInputs, updateFromRgb]);

    // Handle HSL input changes
    const handleHslChange = useCallback((key, value) => {
        const numValue = parseInt(value, 10) || 0;
        const newHsl = { ...hslInputs, [key]: numValue };
        setHslInputs(newHsl);
        
        // Convert HSL to RGB
        const h = newHsl.h / 360;
        const s = newHsl.s / 100;
        const l = newHsl.l / 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        updateFromRgb(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), state.rgb.a);
    }, [hslInputs, state.rgb.a, updateFromRgb]);

    // Handle native color picker change
    const handleColorPickerChange = useCallback((e) => {
        handleHexChange(e.target.value);
    }, [handleHexChange]);

    // EyeDropper functionality
    const openEyeDropper = useCallback(async () => {
        if (!eyedropperSupported) return;
        
        setIsPicking(true);
        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result.sRGBHex) {
                handleHexChange(result.sRGBHex);
            }
        } catch (e) {
            // User cancelled or error
        } finally {
            setIsPicking(false);
        }
    }, [eyedropperSupported, handleHexChange]);

    // Copy to clipboard
    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text);
    }, []);

    // Load color from history
    const loadFromHistory = useCallback((item) => {
        const rgb = hexToRgb(item.hex);
        if (rgb) {
            updateFromRgb(rgb.r, rgb.g, rgb.b, rgb.a);
        }
    }, [updateFromRgb]);

    // Generate random color
    const generateRandomColor = useCallback(() => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        updateFromRgb(r, g, b, 1);
    }, [updateFromRgb]);

    const languageTabs = [
        { id: 'css', label: 'CSS' },
        { id: 'swift', label: 'Swift' },
        { id: 'dotnet', label: '.NET' },
        { id: 'java', label: 'Java' },
        { id: 'android', label: 'Android' },
        { id: 'objc', label: 'Obj-C' },
        { id: 'flutter', label: 'Flutter' },
        { id: 'unity', label: 'Unity' },
        { id: 'reactnative', label: 'React Native' },
        { id: 'opengl', label: 'OpenGL' },
        { id: 'svg', label: 'SVG' }
    ];

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'hidden' }}>
            <ToolHeader 
                title="Color Converter" 
                description="Pick colors and generate code snippets for multiple programming languages." 
            />

            <ToolControls style={{ flexWrap: 'nowrap' }}>
                {/* Color Preview & Picker */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            backgroundColor: state.hex,
                            border: '2px solid var(--cds-border-strong)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <input
                                type="color"
                                value={state.hex.startsWith('#') && state.hex.length === 9 ? state.hex.slice(0, 7) : state.hex}
                                onChange={handleColorPickerChange}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <Button
                            size="sm"
                            kind="secondary"
                            renderIcon={ColorPalette}
                            onClick={generateRandomColor}
                        >
                            Random
                        </Button>
                    </div>
                    
                    {eyedropperSupported && (
                        <Button
                            size="sm"
                            kind="primary"
                            renderIcon={Eyedropper}
                            onClick={openEyeDropper}
                            disabled={isPicking}
                        >
                            {isPicking ? 'Picking...' : 'Pick Color'}
                        </Button>
                    )}
                </div>

                {/* Input Controls */}
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    {/* Hex Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '120px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>HEX</label>
                        <TextInput
                            id="hex-input"
                            value={hexInput}
                            onChange={(e) => handleHexChange(e.target.value)}
                            onBlur={handleHexBlur}
                            placeholder="#3DD6F5"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            size="sm"
                            invalid={!isHexValid}
                            invalidText="Invalid hex color"
                        />
                    </div>

                    {/* RGB Inputs */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>R</label>
                            <TextInput
                                id="rgb-r"
                                type="number"
                                min="0"
                                max="255"
                                value={rgbInputs.r}
                                onChange={(e) => handleRgbChange('r', e.target.value)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>G</label>
                            <TextInput
                                id="rgb-g"
                                type="number"
                                min="0"
                                max="255"
                                value={rgbInputs.g}
                                onChange={(e) => handleRgbChange('g', e.target.value)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>B</label>
                            <TextInput
                                id="rgb-b"
                                type="number"
                                min="0"
                                max="255"
                                value={rgbInputs.b}
                                onChange={(e) => handleRgbChange('b', e.target.value)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>A</label>
                            <TextInput
                                id="rgb-a"
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={rgbInputs.a}
                                onChange={(e) => handleRgbChange('a', e.target.value)}
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* HSL Inputs */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>H</label>
                            <TextInput
                                id="hsl-h"
                                type="number"
                                min="0"
                                max="360"
                                value={hslInputs.h}
                                onChange={(e) => handleHslChange('h', e.target.value)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>S%</label>
                            <TextInput
                                id="hsl-s"
                                type="number"
                                min="0"
                                max="100"
                                value={hslInputs.s}
                                onChange={(e) => handleHslChange('s', e.target.value)}
                                size="sm"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>L%</label>
                            <TextInput
                                id="hsl-l"
                                type="number"
                                min="0"
                                max="100"
                                value={hslInputs.l}
                                onChange={(e) => handleHslChange('l', e.target.value)}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Layout Toggle */}
                <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
                    <ToolLayoutToggle
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        position="controls"
                    />
                </div>
            </ToolControls>

            {/* Format Values */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>RGB:</span>
                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        {state.rgb.r}, {state.rgb.g}, {state.rgb.b}
                    </code>
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b}`)}
                        iconDescription="Copy RGB"
                    />
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>HEX:</span>
                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        {state.hex}
                    </code>
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(state.hex)}
                        iconDescription="Copy HEX"
                    />
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>HSL:</span>
                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        {state.hsl.h}°, {state.hsl.s}%, {state.hsl.l}%
                    </code>
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${state.hsl.h}°, ${state.hsl.s}%, ${state.hsl.l}%`)}
                        iconDescription="Copy HSL"
                    />
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>HSV:</span>
                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        {state.hsv.h}°, {state.hsv.s}%, {state.hsv.v}%
                    </code>
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${state.hsv.h}°, ${state.hsv.s}%, ${state.hsv.v}%`)}
                        iconDescription="Copy HSV"
                    />
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>CMYK:</span>
                    <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        {state.cmyk.c}%, {state.cmyk.m}%, {state.cmyk.y}%, {state.cmyk.k}%
                    </code>
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${state.cmyk.c}%, ${state.cmyk.m}%, ${state.cmyk.y}%, ${state.cmyk.k}%`)}
                        iconDescription="Copy CMYK"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                flex: 1, 
                minHeight: 0,
                flexDirection: layout.direction === 'horizontal' ? 'row' : 'column'
            }}>
                {/* Color History */}
                {state.history.length > 0 && (
                    <div style={{
                        width: layout.direction === 'horizontal' ? '200px' : '100%',
                        minWidth: layout.direction === 'horizontal' ? '200px' : 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--cds-border-strong)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: 'var(--cds-layer)',
                            borderBottom: '1px solid var(--cds-border-strong)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>History</span>
                            <Button
                                hasIconOnly
                                renderIcon={TrashCan}
                                kind="ghost"
                                size="sm"
                                onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
                                iconDescription="Clear history"
                            />
                        </div>
                        <div style={{ 
                            flex: 1, 
                            overflowY: 'auto',
                            padding: '0.5rem'
                        }}>
                            {state.history.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => loadFromHistory(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginBottom: '0.25rem',
                                        backgroundColor: 'var(--cds-layer-hover)'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        backgroundColor: item.hex,
                                        border: '1px solid var(--cds-border-strong)'
                                    }} />
                                    <span style={{ 
                                        fontFamily: "'IBM Plex Mono', monospace",
                                        fontSize: '0.75rem'
                                    }}>
                                        {item.hex}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Code Snippets */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Tabs 
                        selectedIndex={state.selectedTab}
                        onChange={({ selectedIndex }) => dispatch({ type: 'SET_SELECTED_TAB', payload: selectedIndex })}
                    >
                        <TabList aria-label="Language tabs" contained style={{ overflowX: 'auto' }}>
                            {languageTabs.map(tab => (
                                <Tab key={tab.id}>{tab.label}</Tab>
                            ))}
                        </TabList>
                        <TabPanels style={{ flex: 1, overflow: 'auto', maxHeight: '400px' }}>
                            {languageTabs.map(tab => (
                                <TabPanel key={tab.id} style={{ padding: '1rem 0', height: '350px', overflow: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {(codeSnippets[tab.id] || []).map((snippet, idx) => (
                                            <Tile key={idx} style={{ padding: '1rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--cds-text-secondary)',
                                                            marginBottom: '0.5rem',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {snippet.name}
                                                        </div>
                                                        <pre style={{
                                                            fontFamily: "'IBM Plex Mono', monospace",
                                                            fontSize: '0.875rem',
                                                            margin: 0,
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-all',
                                                            color: 'var(--cds-text-primary)',
                                                            maxHeight: '200px',
                                                            overflow: 'auto'
                                                        }}>
                                                            {snippet.code}
                                                        </pre>
                                                    </div>
                                                    <Button
                                                        hasIconOnly
                                                        renderIcon={Copy}
                                                        kind="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(snippet.code)}
                                                        iconDescription="Copy"
                                                    />
                                                </div>
                                            </Tile>
                                        ))}
                                    </div>
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
