import { useState, useEffect, useCallback } from 'react';
import { getInitialLayoutDirection, saveLayoutDirection } from '../utils/layoutUtils';

/**
 * Custom hook for managing toggleable layout state
 * 
 * @param {Object} options
 * @param {string} options.toolKey - Unique key for the tool (e.g., 'jwt-debugger')
 * @param {'horizontal'|'vertical'} [options.defaultDirection='horizontal'] - Initial direction
 * @param {boolean} [options.showToggle=true] - Whether toggle is enabled
 * @param {boolean} [options.persist=false] - Whether to save to localStorage
 * @returns {Object} Layout state and controls
 */
export default function useLayoutToggle({ 
    toolKey,
    defaultDirection = 'horizontal',
    showToggle = true,
    persist = false
}) {
    const [direction, setDirection] = useState(() => 
        getInitialLayoutDirection(toolKey, defaultDirection, persist)
    );
    
    const toggleDirection = useCallback(() => {
        setDirection(prev => {
            const newDirection = prev === 'horizontal' ? 'vertical' : 'horizontal';
            
            if (persist) {
                saveLayoutDirection(toolKey, newDirection);
            }
            
            return newDirection;
        });
    }, [toolKey, persist]);
    
    // Sync with localStorage if persist changes
    useEffect(() => {
        if (persist) {
            saveLayoutDirection(toolKey, direction);
        }
    }, [direction, toolKey, persist]);
    
    return {
        direction,
        isHorizontal: direction === 'horizontal',
        isVertical: direction === 'vertical',
        toggleDirection,
        showToggle
    };
}