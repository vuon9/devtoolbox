import { describe, it, expect } from 'vitest';
import {
  getMonospaceFontFamily,
  getDataFontSize,
  getTextareaResize,
  validateJson,
  formatJson,
  objectToKeyValueString,
} from './inputUtils';

describe('inputUtils', () => {
  describe('getMonospaceFontFamily', () => {
    it('should return IBM Plex Mono font family', () => {
      expect(getMonospaceFontFamily()).toBe("'IBM Plex Mono', monospace");
    });
  });

  describe('getDataFontSize', () => {
    it('should return 0.875rem', () => {
      expect(getDataFontSize()).toBe('0.875rem');
    });
  });

  describe('getTextareaResize', () => {
    it('should return none when both are false', () => {
      expect(getTextareaResize(false, false)).toBe('none');
    });

    it('should return vertical when only height is true', () => {
      expect(getTextareaResize(true, false)).toBe('vertical');
    });

    it('should return horizontal when only width is true', () => {
      expect(getTextareaResize(false, true)).toBe('horizontal');
    });

    it('should return both when both are true', () => {
      expect(getTextareaResize(true, true)).toBe('both');
    });

    it('should default to vertical resize', () => {
      expect(getTextareaResize()).toBe('vertical');
    });
  });

  describe('validateJson', () => {
    it('should return valid for empty string', () => {
      const result = validateJson('');
      expect(result.isValid).toBe(true);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return valid for whitespace-only string', () => {
      const result = validateJson('   ');
      expect(result.isValid).toBe(true);
    });

    it('should parse valid JSON object', () => {
      const result = validateJson('{"key": "value"}');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.error).toBeNull();
    });

    it('should parse valid JSON array', () => {
      const result = validateJson('[1, 2, 3]');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it('should return invalid for malformed JSON', () => {
      const result = validateJson('{"key": value}');
      expect(result.isValid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Unexpected token');
    });
  });

  describe('formatJson', () => {
    it('should format object with default indentation', () => {
      const result = formatJson({ key: 'value' });
      expect(result).toBe('{\n  "key": "value"\n}');
    });

    it('should format with custom indentation', () => {
      const result = formatJson({ key: 'value' }, 4);
      expect(result).toBe('{\n    "key": "value"\n}');
    });

    it('should return empty string for null', () => {
      expect(formatJson(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatJson(undefined)).toBe('');
    });
  });

  describe('objectToKeyValueString', () => {
    it('should convert object to key-value string', () => {
      const result = objectToKeyValueString({ foo: 'bar', num: 42 });
      expect(result).toBe('foo: "bar"\nnum: 42');
    });

    it('should return empty string for null', () => {
      expect(objectToKeyValueString(null)).toBe('');
    });

    it('should return empty string for non-object', () => {
      expect(objectToKeyValueString('string')).toBe('');
    });

    it('should handle nested objects', () => {
      const result = objectToKeyValueString({ nested: { a: 1 } });
      expect(result).toBe('nested: {"a":1}');
    });
  });
});
