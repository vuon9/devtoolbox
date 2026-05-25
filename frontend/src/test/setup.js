import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

if (typeof window !== 'undefined' && !window.localStorage) {
  const store = new Map();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => store.clear(),
      getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
      removeItem: (key) => store.delete(String(key)),
      setItem: (key, value) => store.set(String(key), String(value)),
    },
  });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});
