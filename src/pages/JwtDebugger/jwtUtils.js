// JWT utility functions

export const EXAMPLE_SECRET = 'example-secret';

/**
 * Generate an example JWT token for demonstration
 */
export const generateExampleToken = () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { 
        sub: '1234567890', 
        name: 'John Doe', 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
    
    // Base64URL encode
    const encode = (obj) => {
        const json = JSON.stringify(obj);
        const base64 = btoa(unescape(encodeURIComponent(json)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    
    const encodedHeader = encode(header);
    const encodedPayload = encode(payload);
    const signature = 'example-signature'; // Not a real signature, just for display
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Format validation message for display
 */
export const formatValidationMessage = (isValid, message) => {
    if (!message) return null;
    return { isValid, message };
};

/**
 * Parse JWT token parts (client-side only for display)
 */
export const parseTokenParts = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    try {
        const decode = (str) => {
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(escape(atob(base64)));
            return JSON.parse(json);
        };
        
        return {
            header: decode(parts[0]),
            payload: decode(parts[1]),
            signature: parts[2]
        };
    } catch (err) {
        return null;
    }
};