import { test, expect } from '@playwright/test';

const TOOLS = [
  { slug: 'code-encoder', name: 'Code Encoder' },
  { slug: 'code-encrypter', name: 'Code Encrypter' },
  { slug: 'hash-generator', name: 'Hash Generator' },
  { slug: 'code-converter', name: 'Code Converter' },
  { slug: 'text-utilities', name: 'Text Utilities' },
  { slug: 'number-converter', name: 'Number Converter' },
  { slug: 'datetime-converter', name: 'DateTime Converter' },
  { slug: 'jwt', name: 'JWT Debugger' },
  { slug: 'barcode', name: 'Barcode' },
  { slug: 'data-generator', name: 'Data Generator' },
  { slug: 'code-formatter', name: 'Code Formatter' },
  { slug: 'color-converter', name: 'Color Converter' },
  { slug: 'cron', name: 'Cron' },
  { slug: 'regexp', name: 'RegExp' },
  { slug: 'diff', name: 'Diff' },
];

async function setTheme(page, mode, name) {
  await page.evaluate(
    ({ m, n }) => {
      localStorage.setItem('dt-mode', m);
      localStorage.setItem('dt-name', n);
    },
    { m: mode, n: name }
  );
}

test.describe('Every page — dark/light rendering', () => {
  for (const tool of TOOLS) {
    test(`${tool.name} — light mode`, async ({ page }) => {
      await page.goto(`/tool/${tool.slug}`);
      await page.waitForLoadState('networkidle');
      await setTheme(page, 'light', 'github-light');
      await page.goto(`/tool/${tool.slug}`);
      await page.waitForLoadState('networkidle');

      const hasDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      expect(hasDark).toBe(false);

      const bg = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
      );
      expect(bg).not.toBe('');
      expect(bg.toLowerCase()).not.toMatch(/^#(0[0-9a-f]{2}|1[0-9a-f]{2}|2[0-9a-f]{2})/);
    });

    test(`${tool.name} — dark mode`, async ({ page }) => {
      await page.goto(`/tool/${tool.slug}`);
      await page.waitForLoadState('networkidle');
      await setTheme(page, 'dark', 'github-dark');
      await page.goto(`/tool/${tool.slug}`);
      await page.waitForLoadState('networkidle');

      const hasDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      expect(hasDark).toBe(true);
    });
  }
});
