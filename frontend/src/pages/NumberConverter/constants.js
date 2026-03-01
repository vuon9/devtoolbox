// Constants and configuration for Number Converter

/**
 * Base configurations for standard number systems
 */
export const BASES = {
  BINARY: {
    id: 'bin',
    label: 'Binary',
    base: 2,
    placeholder: 'Enter binary number...',
    example: '101010',
  },
  OCTAL: {
    id: 'oct',
    label: 'Octal',
    base: 8,
    placeholder: 'Enter octal number...',
    example: '52',
  },
  DECIMAL: {
    id: 'dec',
    label: 'Decimal',
    base: 10,
    placeholder: 'Enter decimal number...',
    example: '42',
  },
  HEXADECIMAL: {
    id: 'hex',
    label: 'Hexadecimal',
    base: 16,
    placeholder: 'Enter hex number...',
    example: '2A',
  },
};

/**
 * Generate options for custom bases (2-36)
 * @returns {Array<{id: string, label: string, value: number}>}
 */
export const CUSTOM_BASE_OPTIONS = Array.from({ length: 35 }, (_, i) => ({
  id: `${i + 2}`,
  label: `Base ${i + 2}`,
  value: i + 2,
}));

/**
 * Bitwise operation definitions
 */
export const BITWISE_OPERATIONS = {
  SHIFT_LEFT: {
    id: 'shiftLeft',
    label: '<< 1',
    description: 'Shift left by 1 bit',
    apply: (value) => (value << 1) >>> 0,
  },
  SHIFT_RIGHT: {
    id: 'shiftRight',
    label: '>> 1',
    description: 'Logical shift right by 1 bit',
    apply: (value) => value >>> 1,
  },
  NOT: {
    id: 'not',
    label: 'NOT',
    description: 'Flip all bits',
    apply: (value) => (~value) >>> 0,
  },
  MASK_BYTE: {
    id: 'maskByte',
    label: '& 0xFF',
    description: 'Keep only lowest byte',
    apply: (value) => value & 0xFF,
  },
  SET_LSB: {
    id: 'setLSB',
    label: '| 1',
    description: 'Set least significant bit',
    apply: (value) => value | 1,
  },
};

/**
 * Valid characters for each base
 */
export const VALID_CHARS = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789abcdefABCDEF',
};

/**
 * Generate valid characters for any base (2-36)
 * @param {number} base - Base (2-36)
 * @returns {string} Valid characters
 */
export function getValidCharsForBase(base) {
  if (base <= 10) {
    return '0123456789'.slice(0, base);
  }
  // For bases > 10, include letters
  const digits = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyz'.slice(0, base - 10);
  return digits + letters + letters.toUpperCase();
}

/**
 * Error message templates
 */
export const ERROR_MESSAGES = {
  INVALID_CHAR: (char, base) => `Invalid character '${char}' for base ${base}`,
  NEGATIVE: 'Negative numbers are not supported',
  OVERFLOW: 'Value exceeds 32-bit maximum and was clamped',
  EMPTY: 'Input cannot be empty',
  PARSE_ERROR: (base) => `Invalid number for base ${base}`,
};

/**
 * Numeric limits
 */
export const LIMITS = {
  MAX_32BIT: 0xFFFFFFFF, // 4,294,967,295
  MIN_32BIT: 0,
  MAX_32BIT_DECIMAL: 4294967295,
};

/**
 * Bit position mapping for 32-bit display
 * Organized as 4 rows of 8 bits each
 */
export const BIT_ROWS = [
  { row: 0, startBit: 24, endBit: 31, label: '31-24' }, // MSB
  { row: 1, startBit: 16, endBit: 23, label: '23-16' },
  { row: 2, startBit: 8, endBit: 15, label: '15-8' },
  { row: 3, startBit: 0, endBit: 7, label: '7-0' }, // LSB
];

/**
 * Bit cell visual configuration
 */
export const BIT_CELL_CONFIG = {
  SIZE: 32, // px
  GAP: 4, // px
  ACTIVE_COLOR: 'var(--cds-interactive-01)',
  INACTIVE_BORDER: 'var(--cds-border-strong)',
  HOVER_SCALE: 1.1,
};

/**
 * Input modes for the converter
 */
export const INPUT_MODES = {
  BINARY: 'bin',
  OCTAL: 'oct',
  DECIMAL: 'dec',
  HEXADECIMAL: 'hex',
  CUSTOM: 'custom',
};

/**
 * Default custom base
 */
export const DEFAULT_CUSTOM_BASE = 36;

/**
 * Initial state for the reducer
 */
export const INITIAL_STATE = {
  value: 0,
  inputMode: INPUT_MODES.DECIMAL,
  customBase: DEFAULT_CUSTOM_BASE,
  errors: {},
};
