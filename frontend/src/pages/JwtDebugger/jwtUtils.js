// JWT utility functions

export const EXAMPLE_SECRET = 'example-secret';

/**
 * Generate an example JWT token for demonstration
 */
/**
 * Generate an example JWT token for demonstration
 * Note: Actual signing is now performed via the Backend bridge in components
 */
export const generateExampleToken = () => {
    // This is a static placeholder; components should use Backend.JWTService.Encode for dynamic tokens
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
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