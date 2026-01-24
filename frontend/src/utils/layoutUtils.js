/**
 * Layout utilities for responsive and toggleable layouts
 */

/**
 * Get initial layout direction from localStorage or default
 * @param {string} toolKey - Unique key for the tool (e.g., 'jwt-debugger')
 * @param {'horizontal'|'vertical'} defaultDirection - Default direction
 * @param {boolean} persist - Whether to use localStorage
 * @returns {'horizontal'|'vertical'}
 */
export const getInitialLayoutDirection = (toolKey, defaultDirection = 'horizontal', persist = false) => {
    if (!persist) return defaultDirection;
    
    try {
        const saved = localStorage.getItem(`${toolKey}-layout-direction`);
        return saved === 'vertical' ? 'vertical' : defaultDirection;
    } catch (error) {
        console.warn('Failed to read layout direction from localStorage:', error);
        return defaultDirection;
    }
};

/**
 * Save layout direction to localStorage
 * @param {string} toolKey - Unique key for the tool
 * @param {'horizontal'|'vertical'} direction - Direction to save
 */
export const saveLayoutDirection = (toolKey, direction) => {
    try {
        localStorage.setItem(`${toolKey}-layout-direction`, direction);
    } catch (error) {
        console.warn('Failed to save layout direction to localStorage:', error);
    }
};

/**
 * Calculate responsive breakpoints for layout
 * @param {number} width - Container width in pixels
 * @returns {Object} Breakpoint information
 */
export const getResponsiveBreakpoint = (width) => {
    if (width < 768) return { name: 'xs', columns: 1, shouldStack: true };
    if (width < 1024) return { name: 'md', columns: 2, shouldStack: false };
    return { name: 'lg', columns: 2, shouldStack: false };
};

/**
 * Get appropriate gap size based on layout direction and breakpoint
 * @param {'horizontal'|'vertical'} direction 
 * @param {string} breakpoint 
 * @returns {string} CSS gap value
 */
export const getLayoutGap = (direction, breakpoint) => {
    const gaps = {
        horizontal: { xs: '0.75rem', md: '1rem', lg: '1rem' },
        vertical: { xs: '0.5rem', md: '0.75rem', lg: '0.75rem' }
    };
    
    return gaps[direction]?.[breakpoint] || '1rem';
};