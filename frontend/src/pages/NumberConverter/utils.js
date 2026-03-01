// Utility functions for number conversion and bit manipulation

import { LIMITS, ERROR_MESSAGES, getValidCharsForBase } from './constants';

/**
 * Sanitize input string - trim whitespace and remove non-printable chars
 * @param {string} input - Raw input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[\s\u0000-\u001F\u007F-\u009F]/g, '');
}

/**
 * Check if input contains only valid characters for a base
 * @param {string} input - Input to validate
 * @param {number} base - Base (2-36)
 * @returns {object} { valid: boolean, invalidChar: string|null }
 */
export function validateInputChars(input, base) {
  const validChars = getValidCharsForBase(base);
  
  for (const char of input) {
    if (!validChars.includes(char)) {
      return { valid: false, invalidChar: char };
    }
  }
  
  return { valid: true, invalidChar: null };
}

/**
 * Parse input string to 32-bit unsigned integer
 * @param {string} input - Input string
 * @param {number} base - Base (2-36)
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseInput(input, base) {
  const sanitized = sanitizeInput(input);
  
  if (sanitized === '') {
    return { value: null, error: null }; // Empty is valid (no change)
  }
  
  // Check for negative sign
  if (sanitized.startsWith('-')) {
    return { value: null, error: ERROR_MESSAGES.NEGATIVE };
  }
  
  // Check for scientific notation
  if (/[eE]/.test(sanitized)) {
    return { value: null, error: ERROR_MESSAGES.PARSE_ERROR(base) };
  }
  
  // Validate characters
  const { valid, invalidChar } = validateInputChars(sanitized, base);
  if (!valid) {
    return { value: null, error: ERROR_MESSAGES.INVALID_CHAR(invalidChar, base) };
  }
  
  // Parse the number
  const parsed = parseInt(sanitized, base);
  
  if (isNaN(parsed)) {
    return { value: null, error: ERROR_MESSAGES.PARSE_ERROR(base) };
  }
  
  // Check for overflow and clamp
  let value = parsed;
  let error = null;
  
  if (value < 0) {
    return { value: null, error: ERROR_MESSAGES.NEGATIVE };
  }
  
  if (value > LIMITS.MAX_32BIT_DECIMAL) {
    value = LIMITS.MAX_32BIT;
    error = ERROR_MESSAGES.OVERFLOW;
  }
  
  // Ensure unsigned 32-bit
  value = value >>> 0;
  
  return { value, error };
}

/**
 * Parse decimal input
 * @param {string} input - Decimal string
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseDecimal(input) {
  return parseInput(input, 10);
}

/**
 * Parse hexadecimal input
 * @param {string} input - Hex string (with or without 0x prefix)
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseHex(input) {
  let sanitized = sanitizeInput(input);
  
  // Remove 0x or 0X prefix if present
  if (sanitized.toLowerCase().startsWith('0x')) {
    sanitized = sanitized.slice(2);
  }
  
  return parseInput(sanitized, 16);
}

/**
 * Parse binary input
 * @param {string} input - Binary string (with or without 0b prefix)
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseBinary(input) {
  let sanitized = sanitizeInput(input);
  
  // Remove 0b or 0B prefix if present
  if (sanitized.toLowerCase().startsWith('0b')) {
    sanitized = sanitized.slice(2);
  }
  
  return parseInput(sanitized, 2);
}

/**
 * Parse octal input
 * @param {string} input - Octal string (with or without 0o prefix)
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseOctal(input) {
  let sanitized = sanitizeInput(input);
  
  // Remove 0o or 0O prefix if present
  if (sanitized.toLowerCase().startsWith('0o')) {
    sanitized = sanitized.slice(2);
  }
  
  return parseInput(sanitized, 8);
}

/**
 * Parse input for custom base
 * @param {string} input - Input string
 * @param {number} base - Custom base (2-36)
 * @returns {object} { value: number|null, error: string|null }
 */
export function parseCustomBase(input, base) {
  if (base < 2 || base > 36) {
    return { value: null, error: 'Base must be between 2 and 36' };
  }
  return parseInput(input, base);
}

/**
 * Format number as decimal string
 * @param {number} value - 32-bit unsigned integer
 * @returns {string} Decimal representation
 */
export function formatDecimal(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  // Ensure unsigned and format with thousand separators
  const unsigned = value >>> 0;
  return unsigned.toLocaleString('en-US');
}

/**
 * Format number as hexadecimal string
 * @param {number} value - 32-bit unsigned integer
 * @returns {string} Hex representation (uppercase, no prefix)
 */
export function formatHex(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  const unsigned = value >>> 0;
  return unsigned.toString(16).toUpperCase();
}

/**
 * Format number as binary string
 * @param {number} value - 32-bit unsigned integer
 * @returns {string} Binary representation (32 bits, grouped by 4)
 */
export function formatBinary(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  const unsigned = value >>> 0;
  const binary = unsigned.toString(2).padStart(32, '0');
  // Group by 4 bits
  return binary.match(/.{4}/g).join(' ');
}

/**
 * Format number as octal string
 * @param {number} value - 32-bit unsigned integer
 * @returns {string} Octal representation
 */
export function formatOctal(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  const unsigned = value >>> 0;
  return unsigned.toString(8);
}

/**
 * Format number as custom base string
 * @param {number} value - 32-bit unsigned integer
 * @param {number} base - Base (2-36)
 * @returns {string} Formatted representation
 */
export function formatCustomBase(value, base) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }
  if (base < 2 || base > 36) {
    return '';
  }
  const unsigned = value >>> 0;
  return unsigned.toString(base).toUpperCase();
}

/**
 * Format number for display in specified base
 * @param {number} value - 32-bit unsigned integer
 * @param {number} base - Base (2-36)
 * @returns {string} Formatted representation
 */
export function formatNumber(value, base) {
  switch (base) {
    case 2:
      return formatBinary(value);
    case 8:
      return formatOctal(value);
    case 10:
      return formatDecimal(value);
    case 16:
      return formatHex(value);
    default:
      return formatCustomBase(value, base);
  }
}

/**
 * Get bit value at specific position
 * @param {number} value - 32-bit unsigned integer
 * @param {number} position - Bit position (0-31)
 * @returns {number} 0 or 1
 */
export function getBit(value, position) {
  if (position < 0 || position > 31) {
    return 0;
  }
  return ((value >>> position) & 1);
}

/**
 * Toggle bit at specific position
 * @param {number} value - 32-bit unsigned integer
 * @param {number} position - Bit position (0-31)
 * @returns {number} New value with bit toggled
 */
export function toggleBit(value, position) {
  if (position < 0 || position > 31) {
    return value >>> 0;
  }
  return ((value ^ (1 << position)) >>> 0);
}

/**
 * Set bit at specific position
 * @param {number} value - 32-bit unsigned integer
 * @param {number} position - Bit position (0-31)
 * @returns {number} New value with bit set
 */
export function setBit(value, position) {
  if (position < 0 || position > 31) {
    return value >>> 0;
  }
  return ((value | (1 << position)) >>> 0);
}

/**
 * Clear bit at specific position
 * @param {number} value - 32-bit unsigned integer
 * @param {number} position - Bit position (0-31)
 * @returns {number} New value with bit cleared
 */
export function clearBit(value, position) {
  if (position < 0 || position > 31) {
    return value >>> 0;
  }
  return ((value & ~(1 << position)) >>> 0);
}

/**
 * Shift left by n bits
 * @param {number} value - 32-bit unsigned integer
 * @param {number} n - Number of bits to shift
 * @returns {number} Shifted value (32-bit)
 */
export function shiftLeft(value, n = 1) {
  const shiftAmount = Math.max(0, Math.floor(n));
  if (shiftAmount >= 32) {
    return 0;
  }
  return ((value << shiftAmount) >>> 0);
}

/**
 * Logical shift right by n bits
 * @param {number} value - 32-bit unsigned integer
 * @param {number} n - Number of bits to shift
 * @returns {number} Shifted value (32-bit)
 */
export function shiftRight(value, n = 1) {
  const shiftAmount = Math.max(0, Math.floor(n));
  if (shiftAmount >= 32) {
    return 0;
  }
  return (value >>> shiftAmount);
}

/**
 * Bitwise NOT operation
 * @param {number} value - 32-bit unsigned integer
 * @returns {number} Inverted value (32-bit)
 */
export function bitwiseNot(value) {
  return (~value >>> 0);
}

/**
 * Bitwise AND with mask
 * @param {number} value - 32-bit unsigned integer
 * @param {number} mask - Mask value
 * @returns {number} Result (32-bit)
 */
export function bitwiseAnd(value, mask) {
  return ((value & mask) >>> 0);
}

/**
 * Bitwise OR with mask
 * @param {number} value - 32-bit unsigned integer
 * @param {number} mask - Mask value
 * @returns {number} Result (32-bit)
 */
export function bitwiseOr(value, mask) {
  return ((value | mask) >>> 0);
}

/**
 * Get byte value (0-255) at specific byte position
 * @param {number} value - 32-bit unsigned integer
 * @param {number} bytePos - Byte position (0-3, 0 = LSB)
 * @returns {number} Byte value (0-255)
 */
export function getByte(value, bytePos) {
  if (bytePos < 0 || bytePos > 3) {
    return 0;
  }
  return ((value >>> (bytePos * 8)) & 0xFF);
}

/**
 * Format byte as hex string
 * @param {number} byteValue - Byte value (0-255)
 * @returns {string} Hex string (2 digits, uppercase)
 */
export function formatByte(byteValue) {
  return byteValue.toString(16).toUpperCase().padStart(2, '0');
}
