// UI Strings Constants for TextBasedConverter
// All hard-coded strings centralized for reusability and i18n support

// Tool Header
export const TOOL_TITLE = 'Text Based Converter';
export const TOOL_DESCRIPTION = 'Your all-in-one text transformation toolkit. Encrypt sensitive data, encode for transmission, hash for verification, escape for code safety, and convert between 40+ formats. Features quick action tags, real-time preview, and smart auto-detection.';

// Storage Keys
export const STORAGE_KEYS = {
    CATEGORY: 'tbc-category',
    METHOD: 'tbc-method',
    SUBMODE: 'tbc-submode',
    CONFIG: 'tbc-config',
    CUSTOM_TAGS: 'tbc-custom-tags'
};

// Default Values
export const DEFAULTS = {
    CATEGORY: 'Encode - Decode',
    METHOD: 'Base64',
    SUBMODE: '',
    CONFIG: {
        key: '',
        iv: '',
        autoRun: true,
        caseSensitive: false
    }
};

// Default Quick Action Tags
export const DEFAULT_COMMON_TAGS = [
    { id: 'url', category: 'Encode - Decode', method: 'URL', label: 'URL Encode' },
    { id: 'all-hashes', category: 'Hash', method: 'All', label: 'All Hashes' },
];

// Labels
export const LABELS = {
    QUICK_SELECT: 'Quick Select:',
    INPUT: (category, subMode, method) => `${category} (${subMode || method}) - Input`,
    OUTPUT: 'Output',
    IMAGE_PREVIEW: 'Image Preview'
};

// Placeholders
export const PLACEHOLDERS = {
    INPUT: 'Enter text here...',
    OUTPUT: 'Result will appear here...',
    IMAGE: 'Enter base64 image data...'
};

// Layout
export const LAYOUT = {
    TOOL_KEY: 'text-based-converter-layout',
    DEFAULT_DIRECTION: 'horizontal'
};

// Error Messages
export const ERRORS = {
    INVALID_BASE64: 'The base64 data may be corrupted or not an image',
    FAILED_TO_LOAD_IMAGE: 'Failed to load image',
    INVALID_DATA: 'Invalid Base64 Data'
};

// Button Labels
export const BUTTONS = {
    ADD: 'Add',
    ADDED: 'Added',
    QUICK_ACTION: 'Quick Action +',
    COPY: 'Copy',
    COPIED: 'Copied!',
    DOWNLOAD: 'Download'
};

// Mode Labels
export const MODES = {
    ENCRYPT: 'Encrypt',
    DECRYPT: 'Decrypt',
    ENCODE: 'Encode',
    DECODE: 'Decode',
    ESCAPE: 'Escape',
    UNESCAPE: 'Unescape'
};

// Category Display Names
export const CATEGORY_LABELS = {
    'Encrypt - Decrypt': 'Encrypt / Decrypt',
    'Encode - Decode': 'Encode / Decode',
    'Escape': 'Escape / Unescape',
    'Convert': 'Convert',
    'Hash': 'Hash'
};
