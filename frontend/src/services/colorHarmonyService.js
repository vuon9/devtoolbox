// Color harmony service utilities
// Provides color harmony calculations and palette generation

import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, validateHex } from './colorService';

/**
 * Converts hex color to HSL object
 * @param {string} hex - Hex color (#RGB or #RRGGBB)
 * @returns {{h: number, s: number, l: number}|null} - HSL object (h: 0-360, s: 0-100, l: 0-100) or null if invalid
 */
export function hexToHsl(hex) {
  if (!validateHex(hex)) return null;
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Converts HSL values to hex string
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color (#RRGGBB)
 */
export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Gets complementary colors (180° opposite on color wheel)
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 2 complementary colors [base, complement]
 */
export function getComplementary(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const complementary = { ...baseHsl };
  complementary.h = (baseHsl.h + 180) % 360;

  return [baseHex.toLowerCase(), hslToHex(complementary.h, complementary.s, complementary.l)];
}

/**
 * Gets analogous colors (±30° adjacent colors on color wheel)
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 3 colors [leftAnalogous, base, rightAnalogous]
 */
export function getAnalogous(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const leftAnalogous = { ...baseHsl };
  leftAnalogous.h = (baseHsl.h - 30 + 360) % 360;

  const rightAnalogous = { ...baseHsl };
  rightAnalogous.h = (baseHsl.h + 30) % 360;

  return [
    hslToHex(leftAnalogous.h, leftAnalogous.s, leftAnalogous.l),
    baseHex.toLowerCase(),
    hslToHex(rightAnalogous.h, rightAnalogous.s, rightAnalogous.l),
  ];
}

/**
 * Gets triadic colors (120° apart forming triangle on color wheel)
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 3 triadic colors
 */
export function getTriadic(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const second = { ...baseHsl };
  second.h = (baseHsl.h + 120) % 360;

  const third = { ...baseHsl };
  third.h = (baseHsl.h + 240) % 360;

  return [
    baseHex.toLowerCase(),
    hslToHex(second.h, second.s, second.l),
    hslToHex(third.h, third.s, third.l),
  ];
}

/**
 * Gets split complementary colors (two colors adjacent to the complement)
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 3 colors [base, leftSplit, rightSplit]
 */
export function getSplitComplementary(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const leftSplit = { ...baseHsl };
  leftSplit.h = (baseHsl.h + 150) % 360;

  const rightSplit = { ...baseHsl };
  rightSplit.h = (baseHsl.h + 210) % 360;

  return [
    baseHex.toLowerCase(),
    hslToHex(leftSplit.h, leftSplit.s, leftSplit.l),
    hslToHex(rightSplit.h, rightSplit.s, rightSplit.l),
  ];
}

/**
 * Gets tetradic/double split complementary colors (90° intervals forming square on color wheel)
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 4 colors
 */
export function getTetradic(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const second = { ...baseHsl };
  second.h = (baseHsl.h + 90) % 360;

  const third = { ...baseHsl };
  third.h = (baseHsl.h + 180) % 360;

  const fourth = { ...baseHsl };
  fourth.h = (baseHsl.h + 270) % 360;

  return [
    baseHex.toLowerCase(),
    hslToHex(second.h, second.s, second.l),
    hslToHex(third.h, third.s, third.l),
    hslToHex(fourth.h, fourth.s, fourth.l),
  ];
}

/**
 * Gets monochromatic colors (same hue, varying saturation and lightness)
 * Returns 5 colors: 2 darker shades, base, and 2 lighter tints
 * @param {string} baseHex - Base hex color
 * @returns {string[]} - Array of 5 monochromatic colors
 */
export function getMonochromatic(baseHex) {
  if (!validateHex(baseHex)) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const variations = [];

  // Darker shades (reduce lightness, slightly reduce saturation)
  for (let i = 2; i >= 1; i--) {
    const shade = { ...baseHsl };
    shade.l = Math.max(5, baseHsl.l - i * 15);
    shade.s = Math.max(0, baseHsl.s - i * 5);
    variations.push(hslToHex(shade.h, shade.s, shade.l));
  }

  // Base color
  variations.push(baseHex.toLowerCase());

  // Lighter tints (increase lightness, slightly reduce saturation)
  for (let i = 1; i <= 2; i++) {
    const tint = { ...baseHsl };
    tint.l = Math.min(95, baseHsl.l + i * 15);
    tint.s = Math.max(0, baseHsl.s - i * 5);
    variations.push(hslToHex(tint.h, tint.s, tint.l));
  }

  return variations;
}

/**
 * Generates shade variations (darker versions by reducing lightness)
 * @param {string} baseHex - Base hex color
 * @param {number} count - Number of shades to generate (default: 5)
 * @returns {string[]} - Array of shade colors from darkest to base
 */
export function getShades(baseHex, count = 5) {
  if (!validateHex(baseHex) || count < 1 || count > 20) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const shades = [];
  const step = (baseHsl.l - 5) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const shade = { ...baseHsl };
    shade.l = Math.max(5, baseHsl.l - i * step);
    shade.s = Math.max(0, baseHsl.s - i * 5);
    shades.push(hslToHex(shade.h, shade.s, shade.l));
  }

  return shades.reverse(); // Return from darkest to lightest
}

/**
 * Generates tint variations (lighter versions by adding white)
 * @param {string} baseHex - Base hex color
 * @param {number} count - Number of tints to generate (default: 5)
 * @returns {string[]} - Array of tint colors from base to lightest
 */
export function getTints(baseHex, count = 5) {
  if (!validateHex(baseHex) || count < 1 || count > 20) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const tints = [];
  const step = (95 - baseHsl.l) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const tint = { ...baseHsl };
    tint.l = Math.min(95, baseHsl.l + i * step);
    tint.s = Math.max(0, baseHsl.s - i * 5);
    tints.push(hslToHex(tint.h, tint.s, tint.l));
  }

  return tints;
}

/**
 * Generates tone variations (desaturated versions by adding gray)
 * @param {string} baseHex - Base hex color
 * @param {number} count - Number of tones to generate (default: 5)
 * @returns {string[]} - Array of tone colors from base to most desaturated
 */
export function getTones(baseHex, count = 5) {
  if (!validateHex(baseHex) || count < 1 || count > 20) return [];

  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];

  const tones = [];
  const step = baseHsl.s / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const tone = { ...baseHsl };
    tone.s = Math.max(0, baseHsl.s - i * step);
    tone.l = baseHsl.l + i * 5; // Slightly increase lightness as we desaturate
    if (tone.l > 95) tone.l = 95;
    tones.push(hslToHex(tone.h, tone.s, tone.l));
  }

  return tones;
}

/**
 * Gets all color harmonies at once
 * @param {string} baseHex - Base hex color
 * @returns {Object|null} - Object containing all harmony types or null if invalid
 */
export function getAllHarmonies(baseHex) {
  if (!validateHex(baseHex)) return null;

  return {
    complementary: getComplementary(baseHex),
    analogous: getAnalogous(baseHex),
    triadic: getTriadic(baseHex),
    splitComplementary: getSplitComplementary(baseHex),
    tetradic: getTetradic(baseHex),
    monochromatic: getMonochromatic(baseHex),
  };
}

// Inline tests to verify functionality
if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  console.log('Running colorHarmonyService tests...');

  // Test 1: Complementary
  const comp = getComplementary('#FF5733');
  console.assert(comp.length === 2, 'getComplementary should return 2 colors');
  console.assert(comp[0] === '#ff5733', 'getComplementary should preserve base color');
  console.log('✓ getComplementary:', comp);

  // Test 2: Analogous
  const analog = getAnalogous('#3B82F6');
  console.assert(analog.length === 3, 'getAnalogous should return 3 colors');
  console.assert(analog[1] === '#3b82f6', 'getAnalogous should have base in middle');
  console.log('✓ getAnalogous:', analog);

  // Test 3: Triadic
  const triadic = getTriadic('#3B82F6');
  console.assert(triadic.length === 3, 'getTriadic should return 3 colors');
  console.log('✓ getTriadic:', triadic);

  // Test 4: Split Complementary
  const split = getSplitComplementary('#3B82F6');
  console.assert(split.length === 3, 'getSplitComplementary should return 3 colors');
  console.log('✓ getSplitComplementary:', split);

  // Test 5: Tetradic
  const tetradic = getTetradic('#3B82F6');
  console.assert(tetradic.length === 4, 'getTetradic should return 4 colors');
  console.log('✓ getTetradic:', tetradic);

  // Test 6: Monochromatic
  const mono = getMonochromatic('#3B82F6');
  console.assert(mono.length === 5, 'getMonochromatic should return 5 colors');
  console.assert(mono[2] === '#3b82f6', 'getMonochromatic should have base in middle');
  console.log('✓ getMonochromatic:', mono);

  // Test 7: Shades
  const shades = getShades('#3B82F6', 5);
  console.assert(shades.length === 5, 'getShades should return correct count');
  console.log('✓ getShades:', shades);

  // Test 8: Tints
  const tints = getTints('#3B82F6', 5);
  console.assert(tints.length === 5, 'getTints should return correct count');
  console.log('✓ getTints:', tints);

  // Test 9: Tones
  const tones = getTones('#3B82F6', 5);
  console.assert(tones.length === 5, 'getTones should return correct count');
  console.log('✓ getTones:', tones);

  // Test 10: Input validation
  console.assert(getComplementary('invalid').length === 0, 'should handle invalid hex');
  console.assert(getComplementary('').length === 0, 'should handle empty string');
  console.assert(getComplementary(null).length === 0, 'should handle null');
  console.log('✓ Input validation: passed all cases');

  // Test 11: Edge case - pure white
  const whiteHarmony = getComplementary('#FFFFFF');
  console.assert(whiteHarmony.length === 2, 'should handle white');
  console.log('✓ White harmony:', whiteHarmony);

  // Test 12: Edge case - pure black
  const blackHarmony = getAnalogous('#000000');
  console.assert(blackHarmony.length === 3, 'should handle black');
  console.log('✓ Black harmony:', blackHarmony);

  // Test 13: hexToHsl
  const hsl = hexToHsl('#3B82F6');
  console.assert(hsl !== null && typeof hsl.h === 'number', 'hexToHsl should return HSL object');
  console.log('✓ hexToHsl:', hsl);

  // Test 14: hslToHex roundtrip
  const hexBack = hslToHex(hsl.h, hsl.s, hsl.l);
  console.assert(hexBack === '#3b82f6', 'hslToHex should match original');
  console.log('✓ hslToHex:', hexBack);

  // Test 15: All harmonies
  const all = getAllHarmonies('#3B82F6');
  console.assert(
    all !== null && Object.keys(all).length === 6,
    'getAllHarmonies should return all harmony types'
  );
  console.log('✓ getAllHarmonies:', Object.keys(all));

  console.log('All colorHarmonyService tests passed! ✨');
}
