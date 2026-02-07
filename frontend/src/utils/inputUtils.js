/**
 * Input utilities for textareas, inputs, and validation
 */

/**
 * Get default monospace font family
 * @returns {string} CSS font-family value
 */
export const getMonospaceFontFamily = () => "'IBM Plex Mono', monospace";

/**
 * Get default font size for data areas
 * @returns {string} CSS font-size value
 */
export const getDataFontSize = () => '0.875rem';

/**
 * Get textarea resize style based on options
 * @param {boolean} resizeHeight - Allow vertical resize
 * @param {boolean} resizeWidth - Allow horizontal resize
 * @returns {string} CSS resize value
 */
export const getTextareaResize = (resizeHeight = true, resizeWidth = false) => {
    if (!resizeHeight && !resizeWidth) return 'none';
    if (resizeHeight && !resizeWidth) return 'vertical';
    if (!resizeHeight && resizeWidth) return 'horizontal';
    return 'both';
};

/**
 * Validate JSON and return parsed object or error
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} { isValid: boolean, data: any, error: string|null }
 */
export const validateJson = (jsonString) => {
    if (!jsonString.trim()) {
        return { isValid: true, data: null, error: null };
    }
    
    try {
        const parsed = JSON.parse(jsonString);
        return { isValid: true, data: parsed, error: null };
    } catch (error) {
        return { 
            isValid: false, 
            data: null, 
            error: error.message 
        };
    }
};

/**
 * Format JSON with indentation
 * @param {any} data - Data to format as JSON
 * @param {number} [indent=2] - Indentation spaces
 * @returns {string} Formatted JSON string
 */
export const formatJson = (data, indent = 2) => {
    if (data == null) return '';
    return JSON.stringify(data, null, indent);
};

/**
 * Convert object to key-value string representation (for Claims display)
 * @param {Object} obj - Object to convert
 * @returns {string} Key: value pairs separated by newlines
 */
export const objectToKeyValueString = (obj) => {
    if (!obj || typeof obj !== 'object') return '';
    
    return Object.entries(obj)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
};