import { test, expect } from '@playwright/test';

test.describe('Code Encoder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-encoder');
    await expect(page.getByRole('heading', { name: 'Code Encoder' })).toBeVisible();
  });

  test('loads with default method Base64 and Encode mode', async ({ page }) => {
    await expect(page.locator('select')).toHaveValue('Base64');
    await expect(page.locator('button').filter({ hasText: 'Encode' })).toHaveCSS(
      'background-color',
      'rgb(39, 39, 42)'
    );
  });

  test('encodes text to Base64', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue('aGVsbG8=');
  });

  test('decodes Base64 to text', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('aGVsbG8gd29ybGQ=');
    await page.locator('button').filter({ hasText: 'Decode' }).click();
    await expect(output).toHaveValue('hello world');
  });

  test('encodes text to Hex (Base16)', async ({ page }) => {
    await page.locator('select').selectOption('Base16 (Hex)');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue('68656c6c6f');
  });

  test('encodes text to Binary', async ({ page }) => {
    await page.locator('select').selectOption('Binary');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('AB');
    await expect(output).toHaveValue(/[01]+/);
  });

  test('encodes text to ROT13', async ({ page }) => {
    await page.locator('select').selectOption('ROT13');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue('uryyb');
  });

  test('escapes URL special characters', async ({ page }) => {
    await page.locator('select').selectOption('URL');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello world & more');
    await page.locator('button').filter({ hasText: 'Escape' }).first().click();
    await expect(output).toHaveValue(/hello\+world/);
  });

  test('unescapes URL encoded text', async ({ page }) => {
    await page.locator('select').selectOption('URL');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello%20world');
    await page.locator('button').filter({ hasText: 'Unescape' }).first().click();
    await expect(output).toHaveValue('hello world');
  });

  test('escapes HTML entities', async ({ page }) => {
    await page.locator('select').selectOption('HTML/XML');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('<div>hello</div>');
    await page.locator('button').filter({ hasText: 'Escape' }).first().click();
    await expect(output).toHaveValue(/&lt;/);
  });

  test('mode toggle labels change for escape methods', async ({ page }) => {
    // Default is encode/decode
    await expect(page.getByRole('button', { name: 'Encode', exact: true })).toBeVisible();

    // Switch to escape method
    await page.locator('select').selectOption('URL');
    await expect(page.getByRole('button', { name: 'Escape', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unescape', exact: true })).toBeVisible();
  });

  test('optgroup labels exist in select', async ({ page }) => {
    const select = page.locator('select');
    // Options inside select are hidden by browser default - check they exist instead
    await expect(select.locator('option[value="Base64"]')).toBeAttached();
    await expect(select.locator('option[value="Base64URL"]')).toBeAttached();
    await expect(select.locator('optgroup[label="Encode / Decode"]')).toBeAttached();
    await expect(select.locator('optgroup[label="Escape / Unescape"]')).toBeAttached();
    // Verify optgroups contain expected number of options
    await expect(select.locator('optgroup[label="Encode / Decode"] option')).toHaveCount(16);
    await expect(select.locator('optgroup[label="Escape / Unescape"] option')).toHaveCount(3);
  });

  test('layout toggle switches between horizontal and vertical', async ({ page }) => {
    const splitPane = page.locator('div[style*="grid-template-columns"]');

    const initialStyle = await splitPane.getAttribute('style');
    expect(initialStyle).toContain('1fr 1fr');

    const mainContent = page.locator('div').filter({ hasText: 'Code Encoder' }).first();
    const toggleButton = mainContent
      .locator('button')
      .filter({ has: page.locator('svg') })
      .nth(1);
    await toggleButton.click();

    await expect(splitPane).toHaveAttribute('style', /1fr;/);
  });

  test('copy button copies output to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const input = page.locator('textarea').first();
    await input.fill('copy test');

    const copyButton = page.locator('button[title="Copy to clipboard"]').first();
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('copy test');
  });

  test('shows error for invalid Base64 input', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('!!!invalid!!!');
    await page.locator('button').filter({ hasText: 'Decode' }).click();
    await expect(output).toHaveValue('');
  });

  test('clears output when input is cleared', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('test');
    await expect(output).not.toHaveValue('');

    await input.fill('');
    await expect(output).toHaveValue('');
  });

  test('encodes text to Morse Code', async ({ page }) => {
    await page.locator('select').selectOption('Morse Code');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('SOS');
    await expect(output).toHaveValue(/\.\.\./);
  });
});
