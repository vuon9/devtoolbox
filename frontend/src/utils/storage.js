/**
 * Storage utility for persisting data in localStorage
 * Works in both browser and Wails environments
 */

const storage = {
  /**
   * Gets a value from localStorage
   * @param {string} key - The key to retrieve
   * @returns {any|null} - The parsed value or null if not found or on error
   */
  get(key) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  },

  /**
   * Sets a value in localStorage
   * @param {string} key - The key to set
   * @param {any} value - The value to store (will be JSON stringified)
   * @returns {boolean} - True if successful, false on error
   */
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Gets a value and parses it as a JSON array
   * @param {string} key - The key to retrieve
   * @returns {Array} - The parsed array or empty array if not found/invalid
   */
  getArray(key) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return [];
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error getting array from localStorage: ${key}`, error);
      return [];
    }
  },

  /**
   * Stringifies and saves an array
   * @param {string} key - The key to set
   * @param {Array} array - The array to store
   * @returns {boolean} - True if successful, false on error
   */
  setArray(key, array) {
    try {
      if (!Array.isArray(array)) {
        console.error(`Value is not an array: ${key}`);
        return false;
      }
      window.localStorage.setItem(key, JSON.stringify(array));
      return true;
    } catch (error) {
      console.error(`Error setting array in localStorage: ${key}`, error);
      return false;
    }
  }
};

export default storage;
