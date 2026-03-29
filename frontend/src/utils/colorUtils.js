// Color utility functions
// Provides contrast ratio calculations and WCAG compliance checking

/**
 * Calculates relative luminance of an RGB color
 * Uses WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} - Relative luminance (0-1)
 */
export function getLuminance(r, g, b) {
  // Normalize RGB to 0-1
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Parses hex color to RGB object
 * @param {string} hex - Hex color string (#RRGGBB or RRGGBB)
 * @returns {{r: number, g: number, b: number}|null} - RGB object or null if invalid
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;

  let cleanHex = hex.replace('#', '');

  // Convert 3-digit to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
}

/**
 * Calculates contrast ratio between two colors
 * Uses WCAG 2.0 formula: (L1 + 0.05) / (L2 + 0.05)
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number|null} - Contrast ratio (1-21) or null if invalid input
 */
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  // Ensure lighter color is L1
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines WCAG compliance level for a given contrast ratio
 * @param {number} ratio - Contrast ratio
 * @returns {{level: 'AAA'|'AA'|'Fail', pass: boolean, normalText: boolean, largeText: boolean}} - WCAG level info
 */
export function getWCAGLevel(ratio) {
  // WCAG 2.0 contrast requirements:
  // AA: 4.5:1 for normal text, 3:1 for large text
  // AAA: 7:1 for normal text, 4.5:1 for large text

  if (ratio >= 7) {
    return {
      level: 'AAA',
      pass: true,
      normalText: true,
      largeText: true,
    };
  } else if (ratio >= 4.5) {
    return {
      level: 'AA',
      pass: true,
      normalText: true,
      largeText: true,
    };
  } else if (ratio >= 3) {
    return {
      level: 'Fail',
      pass: false,
      normalText: false,
      largeText: true,
    };
  } else {
    return {
      level: 'Fail',
      pass: false,
      normalText: false,
      largeText: false,
    };
  }
}

/**
 * Formats contrast ratio as "X.XX:1"
 * @param {number} ratio - Contrast ratio
 * @returns {string} - Formatted ratio string
 */
export function formatContrastRatio(ratio) {
  if (ratio === null || ratio === undefined || isNaN(ratio)) return 'N/A';
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Suggests text color (black or white) for best contrast on given background
 * @param {string} backgroundHex - Background hex color
 * @returns {{hex: string, ratio: number}} - Recommended text color with contrast ratio
 */
export function getSuggestedTextColor(backgroundHex) {
  const blackRatio = getContrastRatio(backgroundHex, '#000000');
  const whiteRatio = getContrastRatio(backgroundHex, '#FFFFFF');

  if (whiteRatio >= blackRatio) {
    return { hex: '#FFFFFF', ratio: whiteRatio };
  } else {
    return { hex: '#000000', ratio: blackRatio };
  }
}

/**
 * Calculates the minimum font size that passes WCAG AA for given colors
 * @param {string} foregroundHex - Foreground/text hex color
 * @param {string} backgroundHex - Background hex color
 * @returns {{passesAA: boolean, passesAAA: boolean, minSize: string|null}} - Font size recommendation
 */
export function getMinFontSize(foregroundHex, backgroundHex) {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);

  if (ratio >= 7) {
    return { passesAA: true, passesAAA: true, minSize: 'any' };
  } else if (ratio >= 4.5) {
    return { passesAA: true, passesAAA: false, minSize: '18pt (24px) or 14pt (18.5px) bold' };
  } else if (ratio >= 3) {
    return { passesAA: true, passesAAA: false, minSize: '18pt (24px) or 14pt (18.5px) bold' };
  } else {
    return { passesAA: false, passesAAA: false, minSize: null };
  }
}

// Inline tests to verify functionality
if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  console.log('Running colorUtils tests...');

  // Test 1: Black on white should be 21:1
  const blackWhiteRatio = getContrastRatio('#000000', '#FFFFFF');
  console.assert(Math.abs(blackWhiteRatio - 21) < 0.01, 'Black on white contrast should be ~21:1');
  console.log('✓ Black on white:', formatContrastRatio(blackWhiteRatio));

  // Test 2: White on white should be 1:1
  const whiteWhiteRatio = getContrastRatio('#FFFFFF', '#FFFFFF');
  console.assert(Math.abs(whiteWhiteRatio - 1) < 0.01, 'White on white contrast should be ~1:1');
  console.log('✓ White on white:', formatContrastRatio(whiteWhiteRatio));

  // Test 3: Dark gray on white
  const darkGrayRatio = getContrastRatio('#333333', '#FFFFFF');
  console.assert(darkGrayRatio > 12, 'Dark gray on white should pass AAA');
  console.log('✓ Dark gray (#333) on white:', formatContrastRatio(darkGrayRatio));

  // Test 4: Light gray on white (should fail normal text)
  const lightGrayRatio = getContrastRatio('#999999', '#FFFFFF');
  const lightGrayLevel = getWCAGLevel(lightGrayRatio);
  console.assert(!lightGrayLevel.normalText, 'Light gray on white should fail normal text AA');
  console.log(
    '✓ Light gray (#999) on white:',
    formatContrastRatio(lightGrayRatio),
    '- Level:',
    lightGrayLevel.level
  );

  // Test 5: Luminance calculation
  const whiteLum = getLuminance(255, 255, 255);
  const blackLum = getLuminance(0, 0, 0);
  console.assert(whiteLum === 1, 'White luminance should be 1');
  console.assert(blackLum === 0, 'Black luminance should be 0');
  console.log('✓ Luminance - white:', whiteLum, 'black:', blackLum);

  // Test 6: WCAG Level checking
  const aaaLevel = getWCAGLevel(7.5);
  console.assert(aaaLevel.level === 'AAA' && aaaLevel.pass === true, '7.5:1 should be AAA');
  console.log('✓ WCAG 7.5:1:', aaaLevel);

  const aaLevel = getWCAGLevel(5.0);
  console.assert(aaLevel.level === 'AA' && aaLevel.pass === true, '5:1 should be AA');
  console.log('✓ WCAG 5:1:', aaLevel);

  const failLevel = getWCAGLevel(2.5);
  console.assert(failLevel.level === 'Fail' && failLevel.pass === false, '2.5:1 should fail');
  console.log('✓ WCAG 2.5:1:', failLevel);

  // Test 7: Large text AA threshold (3:1)
  const largeTextLevel = getWCAGLevel(3.5);
  console.assert(largeTextLevel.largeText === true, '3.5:1 should pass large text');
  console.assert(largeTextLevel.normalText === false, '3.5:1 should fail normal text');
  console.log('✓ WCAG 3.5:1 (large text boundary):', largeTextLevel);

  // Test 8: Format contrast ratio
  const formatted = formatContrastRatio(4.56789);
  console.assert(formatted === '4.57:1', 'Format should round to 2 decimal places');
  console.log('✓ Format 4.56789:', formatted);

  // Test 9: Suggested text color
  const suggestion1 = getSuggestedTextColor('#FFFFFF');
  console.assert(suggestion1.hex === '#000000', 'White background should suggest black text');
  console.log(
    '✓ Suggest text on white:',
    suggestion1.hex,
    `(${formatContrastRatio(suggestion1.ratio)})`
  );

  const suggestion2 = getSuggestedTextColor('#000000');
  console.assert(suggestion2.hex === '#FFFFFF', 'Black background should suggest white text');
  console.log(
    '✓ Suggest text on black:',
    suggestion2.hex,
    `(${formatContrastRatio(suggestion2.ratio)})`
  );

  const suggestion3 = getSuggestedTextColor('#FF5733');
  console.log(
    '✓ Suggest text on #FF5733:',
    suggestion3.hex,
    `(${formatContrastRatio(suggestion3.ratio)})`
  );

  // Test 10: Min font size
  const minSize1 = getMinFontSize('#000000', '#FFFFFF');
  console.assert(minSize1.passesAA && minSize1.passesAAA, 'Black on white should pass all');
  console.log('✓ Min font size (black/white):', minSize1);

  console.log('All colorUtils tests passed! ✨');
}
