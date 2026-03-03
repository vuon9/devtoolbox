import { describe, it, expect, beforeEach, vi } from 'vitest';
import storage from './storage';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(storage.get('non-existent')).toBeNull();
    });

    it('should return parsed value for existing key', () => {
      window.localStorage.setItem('test-key', JSON.stringify({ foo: 'bar' }));
      expect(storage.get('test-key')).toEqual({ foo: 'bar' });
    });

    it('should return null and log error for invalid JSON', () => {
      window.localStorage.setItem('invalid', 'not-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(storage.get('invalid')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('set', () => {
    it('should store value as JSON', () => {
      storage.set('test', { data: 'value' });
      expect(window.localStorage.getItem('test')).toBe('{"data":"value"}');
    });

    it('should return true on success', () => {
      expect(storage.set('test', 'value')).toBe(true);
    });

    it('should handle circular reference errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const circular = {};
      circular.self = circular; // Create circular reference

      expect(storage.set('test', circular)).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getArray', () => {
    it('should return empty array for non-existent key', () => {
      expect(storage.getArray('non-existent')).toEqual([]);
    });

    it('should return parsed array for existing key', () => {
      window.localStorage.setItem('array-key', JSON.stringify([1, 2, 3]));
      expect(storage.getArray('array-key')).toEqual([1, 2, 3]);
    });

    it('should return empty array for non-array value', () => {
      window.localStorage.setItem('not-array', JSON.stringify({ foo: 'bar' }));
      expect(storage.getArray('not-array')).toEqual([]);
    });
  });

  describe('setArray', () => {
    it('should store array as JSON', () => {
      storage.setArray('test', [1, 2, 3]);
      expect(window.localStorage.getItem('test')).toBe('[1,2,3]');
    });

    it('should return false for non-array value', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(storage.setArray('test', 'not-array')).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
