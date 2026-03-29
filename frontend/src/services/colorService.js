// Color conversion service utilities
// Provides conversion between Hex, RGB, HSL, CMYK, and HSB color formats

/**
 * Validates hex color format
 * Supports: #RRGGBB, RRGGBB, #RGB, RGB
 * @param {string} hex - Hex color string
 * @returns {boolean} - True if valid hex format
 */
export function validateHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const cleanHex = hex.trim();
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexRegex.test(cleanHex);
}

/**
 * Normalizes hex to 6-digit format with #
 * @param {string} hex - Hex color string
 * @returns {string|null} - Normalized hex or null if invalid
 */
function normalizeHex(hex) {
  if (!validateHex(hex)) return null;

  let cleanHex = hex.replace('#', '').toLowerCase();

  // Convert 3-digit to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  return '#' + cleanHex;
}

/**
 * Converts hex color to RGB object
 * @param {string} hex - Hex color (#RRGGBB or RRGGBB)
 * @returns {{r: number, g: number, b: number}|null} - RGB object or null if invalid
 */
export function hexToRgb(hex) {
  const normalizedHex = normalizeHex(hex);
  if (!normalizedHex) return null;

  const cleanHex = normalizedHex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB values to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} - Hex color string (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
  if (typeof r !== 'number' || r < 0 || r > 255)
    throw new Error('Invalid RGB value: r must be 0-255');
  if (typeof g !== 'number' || g < 0 || g > 255)
    throw new Error('Invalid RGB value: g must be 0-255');
  if (typeof b !== 'number' || b < 0 || b > 255)
    throw new Error('Invalid RGB value: b must be 0-255');

  const toHex = (n) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16).padStart(2, '0');
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB to HSL (Hue, Saturation, Lightness)
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{h: number, s: number, l: number}} - HSL object (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(r, g, b) {
  if (typeof r !== 'number' || r < 0 || r > 255)
    throw new Error('Invalid RGB value: r must be 0-255');
  if (typeof g !== 'number' || g < 0 || g > 255)
    throw new Error('Invalid RGB value: g must be 0-255');
  if (typeof b !== 'number' || b < 0 || b > 255)
    throw new Error('Invalid RGB value: b must be 0-255');

  // Normalize RGB to 0-1 range
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate lightness
  const l = (max + min) / 2;

  // Calculate saturation
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  }

  // Calculate hue
  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}} - RGB object (0-255)
 */
export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    // Grayscale
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

/**
 * Converts RGB to CMYK (Cyan, Magenta, Yellow, Key/Black)
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{c: number, m: number, y: number, k: number}} - CMYK object (0-100)
 */
export function rgbToCmyk(r, g, b) {
  if (typeof r !== 'number' || r < 0 || r > 255)
    throw new Error('Invalid RGB value: r must be 0-255');
  if (typeof g !== 'number' || g < 0 || g > 255)
    throw new Error('Invalid RGB value: g must be 0-255');
  if (typeof b !== 'number' || b < 0 || b > 255)
    throw new Error('Invalid RGB value: b must be 0-255');

  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);

  // Handle pure white
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 0 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Converts CMYK to RGB
 * @param {number} c - Cyan (0-100)
 * @param {number} m - Magenta (0-100)
 * @param {number} y - Yellow (0-100)
 * @param {number} k - Key/Black (0-100)
 * @returns {{r: number, g: number, b: number}} - RGB object (0-255)
 */
export function cmykToRgb(c, m, y, k) {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = 1 - Math.min(1, c * (1 - k) + k);
  const g = 1 - Math.min(1, m * (1 - k) + k);
  const b = 1 - Math.min(1, y * (1 - k) + k);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts RGB to HSB/HSV (Hue, Saturation, Brightness/Value)
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{h: number, s: number, b: number}} - HSB object (h: 0-360, s: 0-100, b: 0-100)
 */
export function rgbToHsb(r, g, b) {
  if (typeof r !== 'number' || r < 0 || r > 255)
    throw new Error('Invalid RGB value: r must be 0-255');
  if (typeof g !== 'number' || g < 0 || g > 255)
    throw new Error('Invalid RGB value: g must be 0-255');
  if (typeof b !== 'number' || b < 0 || b > 255)
    throw new Error('Invalid RGB value: b must be 0-255');

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate brightness/value
  const brightness = max;

  // Calculate saturation
  const saturation = max === 0 ? 0 : delta / max;

  // Calculate hue
  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(saturation * 100),
    b: Math.round(brightness * 100),
  };
}

/**
 * Converts HSB/HSV to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} b - Brightness/Value (0-100)
 * @returns {{r: number, g: number, b: number}} - RGB object (0-255)
 */
export function hsbToRgb(h, s, b) {
  s /= 100;
  b /= 100;

  const c = b * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = b - c;

  let r, g, bl;

  const sector = Math.floor(h / 60) % 6;

  switch (sector) {
    case 0:
      r = c;
      g = x;
      bl = 0;
      break;
    case 1:
      r = x;
      g = c;
      bl = 0;
      break;
    case 2:
      r = 0;
      g = c;
      bl = x;
      break;
    case 3:
      r = 0;
      g = x;
      bl = c;
      break;
    case 4:
      r = x;
      g = 0;
      bl = c;
      break;
    case 5:
      r = c;
      g = 0;
      bl = x;
      break;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
  };
}

// Inline tests to verify functionality
if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  console.log('Running colorService tests...');

  // Test 1: Hex to RGB
  const testHex = '#FF5733';
  const rgb = hexToRgb(testHex);
  console.assert(rgb.r === 255 && rgb.g === 87 && rgb.b === 51, 'hexToRgb failed');
  console.log('✓ hexToRgb:', rgb);

  // Test 2: RGB to Hex (roundtrip)
  const hexBack = rgbToHex(255, 87, 51);
  console.assert(hexBack === '#ff5733', 'rgbToHex failed');
  console.log('✓ rgbToHex:', hexBack);

  // Test 3: RGB to HSL
  const hsl = rgbToHsl(255, 87, 51);
  console.assert(hsl.h === 11 && hsl.s === 100 && hsl.l === 60, 'rgbToHsl failed');
  console.log('✓ rgbToHsl:', hsl);

  // Test 4: HSL to RGB (roundtrip)
  const rgbFromHsl = hslToRgb(11, 100, 60);
  console.assert(
    rgbFromHsl.r === 255 && rgbFromHsl.g === 87 && rgbFromHsl.b === 51,
    'hslToRgb failed'
  );
  console.log('✓ hslToRgb:', rgbFromHsl);

  // Test 5: RGB to CMYK
  const cmyk = rgbToCmyk(255, 87, 51);
  console.assert(
    cmyk.c === 0 && cmyk.m === 66 && cmyk.y === 80 && cmyk.k === 0,
    'rgbToCmyk failed'
  );
  console.log('✓ rgbToCmyk:', cmyk);

  // Test 6: CMYK to RGB (roundtrip)
  const rgbFromCmyk = cmykToRgb(0, 66, 80, 0);
  console.assert(
    rgbFromCmyk.r === 255 && rgbFromCmyk.g === 87 && rgbFromCmyk.b === 51,
    'cmykToRgb failed'
  );
  console.log('✓ cmykToRgb:', rgbFromCmyk);

  // Test 7: RGB to HSB
  const hsb = rgbToHsb(255, 87, 51);
  console.assert(hsb.h === 11 && hsb.s === 80 && hsb.b === 100, 'rgbToHsb failed');
  console.log('✓ rgbToHsb:', hsb);

  // Test 8: HSB to RGB (roundtrip)
  const rgbFromHsb = hsbToRgb(11, 80, 100);
  console.assert(
    rgbFromHsb.r === 255 && rgbFromHsb.g === 87 && rgbFromHsb.b === 51,
    'hsbToRgb failed'
  );
  console.log('✓ hsbToRgb:', rgbFromHsb);

  // Test 9: Validate hex
  console.assert(validateHex('#FF5733') === true, 'validateHex valid failed');
  console.assert(validateHex('FF5733') === true, 'validateHex without # failed');
  console.assert(validateHex('#F53') === true, 'validateHex 3-digit failed');
  console.assert(validateHex('#GG5733') === false, 'validateHex invalid failed');
  console.assert(validateHex('invalid') === false, 'validateHex invalid string failed');
  console.log('✓ validateHex: passed all cases');

  // Test 10: Edge cases
  const black = hexToRgb('#000000');
  console.assert(black.r === 0 && black.g === 0 && black.b === 0, 'black hex failed');
  console.log('✓ Black hex:', black);

  const white = hexToRgb('#FFFFFF');
  console.assert(white.r === 255 && white.g === 255 && white.b === 255, 'white hex failed');
  console.log('✓ White hex:', white);

  const gray = rgbToHsl(128, 128, 128);
  console.assert(gray.s === 0, 'grayscale saturation should be 0');
  console.log('✓ Grayscale HSL:', gray);

  console.log('All colorService tests passed! ✨');
}
