import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

if (typeof window !== 'undefined' && !window.localStorage) {
  const storage = new Map();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => storage.clear(),
      getItem: (key) => storage.get(String(key)) ?? null,
      key: (index) => Array.from(storage.keys())[index] ?? null,
      removeItem: (key) => storage.delete(String(key)),
      setItem: (key, value) => storage.set(String(key), String(value)),
      get length() {
        return storage.size;
      },
    },
  });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});
