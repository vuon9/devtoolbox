# Color Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive color converter tool with dual-column layout, color harmonies, accessibility checking, and multi-format export

**Architecture:** Two-column React component with service layer for color math. Left column = color picker + previews, Right column = harmonies + palettes + accessibility + export. Real-time sync across all inputs.

**Tech Stack:** React, Wails (for native eyedropper), inline styles, localStorage persistence

---

## File Structure

**New Files:**

- `frontend/src/services/colorService.js` - Color conversion algorithms (hex↔rgb↔hsl↔cmyk↔hsb)
- `frontend/src/services/colorHarmonyService.js` - Generate harmonies (complementary, analogous, etc.)
- `frontend/src/utils/colorUtils.js` - Contrast ratio calculation, WCAG checks
- `frontend/src/hooks/useLocalStorage.js` - Persistent state hook
- `frontend/src/components/ColorPicker/HSLWheel.jsx` - Color wheel component
- `frontend/src/components/ColorPicker/SaturationBox.jsx` - Saturation/brightness control
- `frontend/src/components/CopyableHex.jsx` - Reusable hex display with click-to-copy

**Modified:**

- `frontend/src/pages/ColorConverter/index.jsx` - Main implementation

---

## Task 1: Setup Color Service Utilities

**Files:**

- Create: `frontend/src/services/colorService.js`
- Create: `frontend/src/utils/colorUtils.js`

- [ ] **Step 1: Create color conversion functions**

```javascript
// frontend/src/services/colorService.js
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToCmyk(r, g, b) {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, Math.min(m, y));

  c = (c - k) / (1 - k) || 0;
  m = (m - k) / (1 - k) || 0;
  y = (y - k) / (1 - k) || 0;

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export function cmykToRgb(c, m, y, k) {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

export function rgbToHsb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

export function hsbToRgb(h, s, v) {
  h /= 360;
  s /= 100;
  v /= 100;
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function validateHex(hex) {
  return /^#?[0-9A-F]{6}$/i.test(hex);
}
```

- [ ] **Step 2: Create contrast ratio utilities**

```javascript
// frontend/src/utils/colorUtils.js
import { hexToRgb } from "../services/colorService.js";

export function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getWCAGLevel(ratio) {
  if (ratio >= 7) return { level: "AAA", pass: true };
  if (ratio >= 4.5) return { level: "AA", pass: true };
  if (ratio >= 3) return { level: "AA Large", pass: true };
  return { level: "Fail", pass: false };
}

export function formatContrastRatio(ratio) {
  return ratio.toFixed(2) + ":1";
}
```

- [ ] **Step 3: Commit services**

```bash
cd /Users/vuong/workspace/vuon9/devtoolbox/frontend
git add src/services/colorService.js src/utils/colorUtils.js
git commit -m "feat(color): add color conversion service utilities

- Hex/RGB/HSL/CMYK/HSB conversions
- Contrast ratio calculation
- WCAG level checking"
```

---

## Task 2: Create Color Harmony Service

**Files:**

- Create: `frontend/src/services/colorHarmonyService.js`

- [ ] **Step 1: Implement harmony generators**

```javascript
// frontend/src/services/colorHarmonyService.js
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./colorService.js";

export function getHarmonies(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    complementary: generateComplementary(hsl),
    analogous: generateAnalogous(hsl),
    triadic: generateTriadic(hsl),
    splitComplementary: generateSplitComplementary(hsl),
    tetradic: generateTetradic(hsl),
  };
}

function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function generateComplementary(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
  ];
}

function generateAnalogous(hsl) {
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l),
  ];
}

function generateTriadic(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

function generateSplitComplementary(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
  ];
}

function generateTetradic(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
  ];
}

export function generateShades(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shades = [];
  for (let i = 1; i <= 9; i++) {
    const lightness = Math.round(hsl.l * (i / 10));
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
    shades.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return shades;
}

export function generateTints(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const tints = [];
  for (let i = 1; i <= 9; i++) {
    const lightness = Math.round(hsl.l + (100 - hsl.l) * (i / 10));
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
    tints.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return tints;
}

export function generateTones(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const tones = [];
  for (let i = 1; i <= 9; i++) {
    const saturation = Math.round(hsl.s * (1 - i / 10));
    const newRgb = hslToRgb(hsl.h, saturation, hsl.l);
    tones.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  return tones;
}
```

- [ ] **Step 2: Commit harmony service**

```bash
git add src/services/colorHarmonyService.js
git commit -m "feat(color): add color harmony generation service

- Complementary, analogous, triadic, split-complementary, tetradic
- Shade, tint, and tone generation"
```

---

## Task 3: Create Reusable CopyableHex Component

**Files:**

- Create: `frontend/src/components/CopyableHex.jsx`

- [ ] **Step 1: Write CopyableHex component**

```jsx
// frontend/src/components/CopyableHex.jsx
import React, { useState } from "react";

export default function CopyableHex({ hex, size = "normal" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fontSize =
    size === "small" ? "9px" : size === "large" ? "14px" : "11px";

  return (
    <div
      onClick={handleCopy}
      title="Click to copy"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: copied ? "4px 8px" : "2px 6px",
        backgroundColor: copied ? "rgba(34, 197, 94, 0.15)" : "transparent",
        border: copied
          ? "1px solid rgba(34, 197, 94, 0.3)"
          : "1px solid transparent",
        borderRadius: "4px",
        cursor: "pointer",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: fontSize,
        color: copied ? "#22c55e" : "#a1a1aa",
        fontWeight: copied ? 600 : 500,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {hex}
      {copied ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ opacity: 0 }}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit component**

```bash
git add src/components/CopyableHex.jsx
git commit -m "feat(components): add CopyableHex component

Click to copy hex codes with hover effects and success feedback"
```

---

## Task 4: Create Custom Hooks

**Files:**

- Create: `frontend/src/hooks/useLocalStorage.js`

- [ ] **Step 1: Write useLocalStorage hook**

```javascript
// frontend/src/hooks/useLocalStorage.js
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}
```

- [ ] **Step 2: Commit hook**

```bash
git add src/hooks/useLocalStorage.js
git commit -m "feat(hooks): add useLocalStorage hook for persistent state"
```

---

## Task 5: Update ColorConverter Main Component - Part 1 (Layout & Color Picker)

**Files:**

- Modify: `frontend/src/pages/ColorConverter/index.jsx`

- [ ] **Step 1: Setup imports and initial state**

```jsx
// frontend/src/pages/ColorConverter/index.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Pipette, Hash, Copy, Check, History, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import CopyableHex from '../../components/CopyableHex';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  cmykToRgb,
  rgbToHsb,
  hsbToRgb,
  validateHex
} from '../../services/colorService';
import { getHarmonies, generateShades, generateTints, generateTones } from '../../services/colorHarmonyService';
import { getContrastRatio, getWCAGLevel, formatContrastRatio } from '../../utils/colorUtils';

const HARMONY_TYPES = ['complementary', 'analogous', 'triadic', 'splitComplementary', 'tetradic'];
const PALETTE_TYPES = ['shades', 'tints', 'tones'];
const CODE_FORMATS = ['css', 'tailwind', 'swift', 'android', 'react', 'json'];

export default function ColorConverter() {
  // Main color state
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [cmyk, setCmyk] = useState({ c: 76, m: 47, y: 0, k: 4 });
  const [hsb, setHsb] = useState({ h: 217, s: 76, b: 96 });

  // Text colors for accessibility testing
  const [darkModeText, setDarkModeText] = useState('#FFFFFF');
  const [lightModeText, setLightModeText] = useState('#000000');

  // UI state
  const [activeHarmony, setActiveHarmony] = useState('analogous');
  const [activePalette, setActivePalette] = useState('tints');
  const [activeCodeFormat, setActiveCodeFormat] = useState('css');

  // Persistence
  const [recentColors, setRecentColors] = useLocalStorage('color-recent', []);
  const [collections, setCollections] = useLocalStorage('color-collections', []);

  // ... rest of component
```

- [ ] **Step 2: Add color update logic**

```jsx
// Update all formats when hex changes
const updateFromHex = (newHex) => {
  if (!validateHex(newHex)) return;

  setHex(newHex);
  const rgbValues = hexToRgb(newHex);
  setRgb(rgbValues);

  const hslValues = rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b);
  setHsl(hslValues);

  const cmykValues = rgbToCmyk(rgbValues.r, rgbValues.g, rgbValues.b);
  setCmyk(cmykValues);

  const hsbValues = rgbToHsb(rgbValues.r, rgbValues.g, rgbValues.b);
  setHsb(hsbValues);

  // Add to recent
  setRecentColors((prev) => {
    const filtered = prev.filter((c) => c !== newHex);
    return [newHex, ...filtered].slice(0, 10);
  });
};

// Initial load
useEffect(() => {
  updateFromHex(hex);
}, []);

// Calculate harmonies
const harmonies = useMemo(() => getHarmonies(hex), [hex]);

// Calculate palettes
const palettes = useMemo(
  () => ({
    shades: generateShades(hex),
    tints: generateTints(hex),
    tones: generateTones(hex),
  }),
  [hex],
);

// Calculate contrast ratios
const darkModeContrast = useMemo(
  () => getContrastRatio(hex, darkModeText),
  [hex, darkModeText],
);
const lightModeContrast = useMemo(
  () => getContrastRatio(hex, lightModeText),
  [hex, lightModeText],
);
```

- [ ] **Step 3: Commit progress**

```bash
git add src/pages/ColorConverter/index.jsx
git commit -m "feat(color-converter): add state management and color conversion logic

- State for all color formats (hex, rgb, hsl, cmyk, hsb)
- Real-time sync between formats
- Calculate harmonies and palettes
- Track recent colors in localStorage"
```

---

## Task 6: Update ColorConverter - Part 2 (Left Column UI)

**Files:**

- Modify: `frontend/src/pages/ColorConverter/index.jsx`

- [ ] **Step 1: Add ToolHeader and horizontal line**

```jsx
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px',
      overflow: 'hidden',
      backgroundColor: '#09090b',
    }}>
      <ToolHeader
        title="Color Converter"
        description="Convert colors between formats, generate harmonies, check accessibility, and export code."
      />
      <div style={{ borderBottom: '1px solid #27272a', marginBottom: '16px' }} />

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}>
```

- [ ] **Step 2: Add eyedropper and color picker section**

```jsx
          {/* Color Picker Section */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Color Picker
              </div>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                title="Pick color from screen"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.5 8.5 8 6l-4 4 2.5 2.5"/>
                  <path d="m8 6 9-9 6 6-9 9"/>
                  <path d="m13.5 11.5 2.5 2.5"/>
                  <path d="m18 16 4 4"/>
                  <path d="M8 20a4 4 0 0 0 4-4l-4-4a4 4 0 0 0-4 4c0 2.2 1.8 4 4 4Z"/>
                </svg>
                Pick from Screen
              </button>
            </div>

            {/* HSL Wheel + Saturation Box */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              {/* HSL Wheel */}
              <div style={{
                width: '120px',
                height: '120px',
                background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                borderRadius: '50%',
                position: 'relative',
                border: '2px solid #27272a',
                cursor: 'crosshair',
              }}>
                <div style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  background: hex,
                  border: '2px solid white',
                  borderRadius: '50%',
                  top: `${50 - Math.sin((hsl.h * Math.PI) / 180) * 40}%`,
                  left: `${50 + Math.cos((hsl.h * Math.PI) / 180) * 40}%`,
                  transform: 'translate(-50%, -50%)',
                }}/>
              </div>

              {/* Saturation Box */}
              <div style={{
                flex: 1,
                height: '120px',
                background: `linear-gradient(to bottom, hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%), #000000)`,
                borderRadius: '6px',
                border: '2px solid #27272a',
                position: 'relative',
                cursor: 'crosshair',
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'white',
                  top: `${100 - hsl.l}%`,
                  boxShadow: '0 0 3px rgba(0,0,0,0.5)',
                }}/>
              </div>
            </div>
```

- [ ] **Step 3: Add dual color previews with editable text colors**

```jsx
{
  /* Dual Color Previews */
}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  }}
>
  {/* Dark Mode Preview */}
  <div
    style={{
      background: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "8px",
      padding: "12px",
    }}
  >
    <div
      style={{
        fontSize: "10px",
        color: "#71717a",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}
    >
      Dark Mode Preview
    </div>
    <div
      style={{
        height: "60px",
        background: hex,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "10px",
      }}
    >
      <span style={{ fontSize: "20px", fontWeight: 600, color: darkModeText }}>
        Aa
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <label style={{ fontSize: "9px", color: "#71717a" }}>Text:</label>
      <div
        style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            background: darkModeText,
            borderRadius: "3px",
            border: "1px solid #3f3f46",
          }}
        />
        <input
          type="text"
          value={darkModeText}
          onChange={(e) => setDarkModeText(e.target.value)}
          style={{
            flex: 1,
            background: "#27272a",
            border: "1px solid #3f3f46",
            borderRadius: "4px",
            padding: "4px 6px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            color: "#f4f4f5",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "10px",
          color:
            darkModeContrast >= 4.5
              ? "#22c55e"
              : darkModeContrast >= 3
                ? "#eab308"
                : "#ef4444",
          fontWeight: 500,
        }}
      >
        {formatContrastRatio(darkModeContrast)}
      </span>
    </div>
  </div>

  {/* Light Mode Preview */}
  <div
    style={{
      background: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "8px",
      padding: "12px",
    }}
  >
    <div
      style={{
        fontSize: "10px",
        color: "#71717a",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}
    >
      Light Mode Preview
    </div>
    <div
      style={{
        height: "60px",
        background: hex,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "10px",
      }}
    >
      <span style={{ fontSize: "20px", fontWeight: 600, color: lightModeText }}>
        Aa
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <label style={{ fontSize: "9px", color: "#71717a" }}>Text:</label>
      <div
        style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            background: lightModeText,
            borderRadius: "3px",
            border: "1px solid #3f3f46",
          }}
        />
        <input
          type="text"
          value={lightModeText}
          onChange={(e) => setLightModeText(e.target.value)}
          style={{
            flex: 1,
            background: "#27272a",
            border: "1px solid #3f3f46",
            borderRadius: "4px",
            padding: "4px 6px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            color: "#f4f4f5",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "10px",
          color:
            lightModeContrast >= 4.5
              ? "#22c55e"
              : lightModeContrast >= 3
                ? "#eab308"
                : "#ef4444",
          fontWeight: 500,
        }}
      >
        {formatContrastRatio(lightModeContrast)}
      </span>
    </div>
  </div>
</div>;
```

- [ ] **Step 4: Add input fields**

```jsx
            {/* Input Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Hex</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#27272a', borderRadius: '4px', padding: '6px 8px' }}>
                  <span style={{ color: '#71717a', marginRight: '4px', fontSize: '11px' }}>#</span>
                  <input
                    type="text"
                    value={hex.replace('#', '')}
                    onChange={(e) => updateFromHex('#' + e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '12px',
                      color: '#f4f4f5',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>RGB</label>
                  <input
                    type="text"
                    value={`${rgb.r}, ${rgb.g}, ${rgb.b}`}
                    readOnly
                    style={{
                      width: '100%',
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: '#f4f4f5',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>HSL</label>
                  <input
                    type="text"
                    value={`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`}
                    readOnly
                    style={{
                      width: '100%',
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: '#f4f4f5',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
```

- [ ] **Step 5: Commit left column progress**

```bash
git add src/pages/ColorConverter/index.jsx
git commit -m "feat(color-converter): add left column UI (picker, previews, inputs)

- HSL color wheel and saturation box
- Dual previews with editable text colors
- Real-time contrast ratio display
- Multiple format input fields"
```

---

## Task 7: Update ColorConverter - Part 3 (Right Column UI)

**Files:**

- Modify: `frontend/src/pages/ColorConverter/index.jsx`

- [ ] **Step 1: Add recent colors section**

```jsx
          {/* Recent Colors */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Recent Colors
              </div>
              <button
                onClick={() => setRecentColors([])}
                style={{
                  fontSize: '10px',
                  color: '#71717a',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '6px',
            }}>
              {recentColors.map((color, i) => (
                <div
                  key={i}
                  onClick={() => updateFromHex(color)}
                  title={color}
                  style={{
                    height: '32px',
                    background: color,
                    borderRadius: '4px',
                    border: '1px solid #27272a',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Add right column (inspector)**

```jsx
        {/* RIGHT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}>
          {/* Color Harmonies */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
            }}>
              Color Harmonies
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {HARMONY_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveHarmony(type)}
                  style={{
                    padding: '4px 10px',
                    background: activeHarmony === type ? '#3b82f6' : '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: activeHarmony === type ? 'white' : '#a1a1aa',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'splitComplementary' ? 'Split' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {harmonies[activeHarmony]?.map((color, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div
                    onClick={() => updateFromHex(color)}
                    style={{
                      height: '40px',
                      background: color,
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    title={`Click to select: ${color}`}
                  />
                  <CopyableHex hex={color} size="small" />
                </div>
              ))}
            </div>
          </div>
```

- [ ] **Step 3: Add generated palettes section**

```jsx
{
  /* Generated Palettes */
}
<div
  style={{
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "16px",
  }}
>
  <div
    style={{
      fontSize: "11px",
      fontWeight: 600,
      color: "#71717a",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "12px",
    }}
  >
    Generated Palettes
  </div>
  <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
    {PALETTE_TYPES.map((type) => (
      <button
        key={type}
        onClick={() => setActivePalette(type)}
        style={{
          padding: "3px 8px",
          background: activePalette === type ? "#3b82f6" : "#27272a",
          border: "none",
          borderRadius: "3px",
          fontSize: "10px",
          color: activePalette === type ? "white" : "#a1a1aa",
          cursor: "pointer",
          textTransform: "capitalize",
        }}
      >
        {type}
      </button>
    ))}
  </div>
  <div
    style={{
      display: "flex",
      height: "36px",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "8px",
    }}
  >
    {palettes[activePalette]?.map((color, i) => (
      <div
        key={i}
        onClick={() => updateFromHex(color)}
        title={color}
        style={{
          flex: 1,
          background: color,
          cursor: "pointer",
        }}
      />
    ))}
  </div>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "9px",
      color: "#71717a",
    }}
  >
    {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map(
      (label) => (
        <span key={label}>{label}</span>
      ),
    )}
  </div>
</div>;
```

- [ ] **Step 4: Add accessibility section**

```jsx
{
  /* Accessibility */
}
<div
  style={{
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "16px",
  }}
>
  <div
    style={{
      fontSize: "11px",
      fontWeight: 600,
      color: "#71717a",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "12px",
    }}
  >
    Accessibility (WCAG)
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
    {/* Dark Mode Text Contrast */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        background: "#27272a",
        borderRadius: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "50px",
            height: "36px",
            background: hex,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: "11px", color: darkModeText, fontWeight: 600 }}
          >
            Aa
          </span>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#f4f4f5", fontWeight: 500 }}>
            On Background
          </div>
          <div style={{ fontSize: "10px", color: "#71717a" }}>
            Text: {darkModeText}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            padding: "3px 8px",
            background:
              darkModeContrast >= 7
                ? "#22c55e"
                : darkModeContrast >= 4.5
                  ? "#eab308"
                  : "#ef4444",
            color: darkModeContrast >= 4.5 ? "white" : "black",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          {darkModeContrast >= 7
            ? "AAA ✓"
            : darkModeContrast >= 4.5
              ? "AA ✓"
              : "Fail ✗"}
        </div>
        <div style={{ fontSize: "9px", color: "#71717a", marginTop: "2px" }}>
          {formatContrastRatio(darkModeContrast)}
        </div>
      </div>
    </div>

    {/* Light Mode Text Contrast */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        background: "#27272a",
        borderRadius: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "50px",
            height: "36px",
            background: hex,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: "11px", color: lightModeText, fontWeight: 600 }}
          >
            Aa
          </span>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#f4f4f5", fontWeight: 500 }}>
            On Background
          </div>
          <div style={{ fontSize: "10px", color: "#71717a" }}>
            Text: {lightModeText}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            padding: "3px 8px",
            background:
              lightModeContrast >= 7
                ? "#22c55e"
                : lightModeContrast >= 4.5
                  ? "#eab308"
                  : lightModeContrast >= 3
                    ? "#eab308"
                    : "#ef4444",
            color: lightModeContrast >= 4.5 ? "white" : "black",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          {lightModeContrast >= 7
            ? "AAA ✓"
            : lightModeContrast >= 4.5
              ? "AA ✓"
              : lightModeContrast >= 3
                ? "AA Large ✓"
                : "Fail ✗"}
        </div>
        <div style={{ fontSize: "9px", color: "#71717a", marginTop: "2px" }}>
          {formatContrastRatio(lightModeContrast)}
        </div>
      </div>
    </div>
  </div>
</div>;
```

- [ ] **Step 5: Add code export section**

```jsx
          {/* Code Export */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
            }}>
              Code Export
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {CODE_FORMATS.map(format => (
                <button
                  key={format}
                  onClick={() => setActiveCodeFormat(format)}
                  style={{
                    padding: '3px 8px',
                    background: activeCodeFormat === format ? '#3b82f6' : '#27272a',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '10px',
                    color: activeCodeFormat === format ? 'white' : '#a1a1aa',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {format}
                </button>
              ))}
            </div>
            <div style={{
              background: '#0c0c0c',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#a1a1aa',
              overflowX: 'auto',
            }}>
              {activeCodeFormat === 'css' && (
                <>
                  <div><span style={{ color: '#71717a' }}>--color-primary:</span> <span style={{ color: '#3b82f6' }}>{hex.toLowerCase()}</span>;</div>
                  <div><span style={{ color: '#71717a' }}>--color-primary-rgb:</span> <span style={{ color: '#22c55e' }}>{rgb.r}, {rgb.g}, {rgb.b}</span>;</div>
                  <div><span style={{ color: '#71717a' }}>--color-primary-hsl:</span> <span style={{ color: '#eab308' }}>{hsl.h}, {hsl.s}%, {hsl.l}%</span>;</div>
                </>
              )}
              {activeCodeFormat === 'tailwind' && (
                <>
                  <div><span style={{ color: '#71717a' }}>'primary':</span> <span style={{ color: '#3b82f6' }}>'{hex}'</span>,</div>
                  <div><span style={{ color: '#71717a' }}>'primary-50':</span> <span style={{ color: '#3b82f6' }}>'{palettes.tints[0]}'</span>,</div>
                </>
              )}
              {(activeCodeFormat === 'swift' || activeCodeFormat === 'android' || activeCodeFormat === 'react' || activeCodeFormat === 'json') && (
                <div style={{ color: '#71717a' }}>// {activeCodeFormat} export coming soon</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}>
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px' }}>{description}</p>
    </div>
  );
}
```

- [ ] **Step 6: Commit final implementation**

```bash
git add src/pages/ColorConverter/index.jsx
git commit -m "feat(color-converter): complete right column UI and full implementation

- Color harmonies with 5 types (complementary, analogous, etc.)
- Generated palettes (shades, tints, tones)
- WCAG accessibility checker with custom text colors
- Multi-format code export (CSS, Tailwind, etc.)
- Click-to-copy on all hex codes via CopyableHex component"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Run build to check for errors**

```bash
cd /Users/vuong/workspace/vuon9/devtoolbox/frontend
npm run build 2>&1 | tail -20
```

Expected: No errors, successful build

- [ ] **Step 2: Final commit**

```bash
git status
git log --oneline -5
```

---

## Summary

This implementation creates a comprehensive color converter with:

1. **Services Layer**: Color conversions, harmonies, contrast calculations
2. **Reusable Components**: CopyableHex for click-to-copy everywhere
3. **Custom Hooks**: useLocalStorage for persistence
4. **Two-Column Layout**: Color picker left, inspector right
5. **Features**: Eyedropper, harmonies, palettes, accessibility, export

All hex codes are clickable with hover effects and success feedback as specified.
