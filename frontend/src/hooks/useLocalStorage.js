import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for persisting state to localStorage with cross-tab synchronization.
 *
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @param {Object} options - Optional configuration
 * @param {Function} options.serialize - Custom serializer (default: JSON.stringify)
 * @param {Function} options.deserialize - Custom deserializer (default: JSON.parse)
 * @returns {[any, Function]} - [value, setValue] - Same as useState but persisted to localStorage
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  // Use ref to track previous value for comparison
  const previousValueRef = useRef(null);

  // Initialize state from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = deserialize(item);
        previousValueRef.current = parsed;
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Helper to check if two values are shallowly equal
  const isShallowEqual = useCallback((a, b) => {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    if (a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }

    return true;
  }, []);

  // Set value that persists to localStorage
  const setValue = useCallback(
    (value) => {
      // SSR safety check
      if (typeof window === 'undefined') {
        return;
      }

      try {
        // Allow value to be a function (same as useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Only update if value actually changed (shallow compare for objects)
        if (isShallowEqual(previousValueRef.current, valueToStore)) {
          return;
        }

        // Update state
        setStoredValue(valueToStore);
        previousValueRef.current = valueToStore;

        // Persist to localStorage
        window.localStorage.setItem(key, serialize(valueToStore));
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue, isShallowEqual]
  );

  // Listen for changes from other tabs
  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event) => {
      if (event.key !== key) return;

      try {
        const newValue = event.newValue ? deserialize(event.newValue) : initialValue;

        // Only update if value actually changed
        if (!isShallowEqual(storedValue, newValue)) {
          setStoredValue(newValue);
          previousValueRef.current = newValue;
        }
      } catch (error) {
        console.warn(`Error parsing localStorage change for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, deserialize, initialValue, storedValue, isShallowEqual]);

  return [storedValue, setValue];
}
