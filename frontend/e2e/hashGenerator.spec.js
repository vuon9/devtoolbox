import { test, expect } from '@playwright/test';

test.describe('Hash Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/hash-generator');
    await expect(page.getByRole('heading', { name: 'Hash Generator' })).toBeVisible();
  });

  test('loads with default method MD5', async ({ page }) => {
    await expect(page.locator('select')).toHaveValue('MD5');
    await expect(page.locator('textarea')).toHaveCount(2);
  });

  test('generates MD5 hash', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue('5d41402abc4b2a76b9719d911017c592');
  });

  test('generates SHA-256 hash', async ({ page }) => {
    await page.locator('select').selectOption('SHA-256');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue(/[a-f0-9]{64}/);
  });

  test('generates SHA-1 hash', async ({ page }) => {
    await page.locator('select').selectOption('SHA-1');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).toHaveValue(/[a-f0-9]{40}/);
  });

  test('generates all hashes at once', async ({ page }) => {
    await page.locator('select').selectOption('All');
    const input = page.locator('textarea').first();

    await input.fill('hello');

    // All hashes mode shows a multi-hash output panel instead of textarea
    await expect(page.locator('span').filter({ hasText: 'All Hashes' })).toBeVisible();
    // The output is JSON rendered in MultiHashOutput component - check page contains hash data
    await expect(page.locator('body')).toContainText('5d41402abc4b2a76b9719d911017c592');
  });

  test('shows HMAC key input when HMAC is selected', async ({ page }) => {
    await page.locator('select').selectOption('HMAC');

    const hmacInput = page.locator('input[placeholder="HMAC Key"]');
    await expect(hmacInput).toBeVisible();
  });

  test('generates HMAC with key', async ({ page }) => {
    await page.locator('select').selectOption('HMAC');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);
    const hmacInput = page.locator('input[placeholder="HMAC Key"]');

    await hmacInput.fill('secretkey');
    await input.fill('hello');

    await expect(output).not.toHaveValue('');
    const hash = await output.inputValue();
    expect(hash.length).toBeGreaterThan(0);
  });

  test('generates CRC32 hash', async ({ page }) => {
    await page.locator('select').selectOption('CRC32');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).not.toHaveValue('');
  });

  test('generates bcrypt hash', async ({ page }) => {
    await page.locator('select').selectOption('bcrypt');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('password123');
    await expect(output).not.toHaveValue('');
    const hash = await output.inputValue();
    expect(hash).toContain('$');
  });

  test('layout toggle switches between horizontal and vertical', async ({ page }) => {
    const splitPane = page.locator('div[style*="grid-template-columns"]');

    const initialStyle = await splitPane.getAttribute('style');
    expect(initialStyle).toContain('1fr 1fr');

    const mainContent = page.locator('div').filter({ hasText: 'Hash Generator' }).first();
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
    await input.fill('copy hash test');

    const copyButton = page.locator('button[title="Copy to clipboard"]').nth(1);
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.length).toBeGreaterThan(0);
  });

  test('clears output when input is cleared', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('test');
    await expect(output).not.toHaveValue('');

    await input.fill('');
    await expect(output).toHaveValue('');
  });

  test('different inputs produce different hashes', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('input1');
    await expect(output).not.toHaveValue('');
    const hash1 = await output.inputValue();

    // Wait for debounce to settle before second input
    await page.waitForTimeout(500);
    await input.fill('something-completely-different');
    // Wait for output to actually change to a new value
    await expect.poll(async () => await output.inputValue()).not.toBe(hash1);
    const hash2 = await output.inputValue();

    expect(hash1).not.toBe(hash2);
  });

  test('same input produces same hash', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('consistent');
    await expect(output).not.toHaveValue('');
    const hash1 = await output.inputValue();

    await input.fill('');
    await input.fill('consistent');
    await expect(output).not.toHaveValue('');
    const hash2 = await output.inputValue();

    expect(hash1).toBe(hash2);
  });

  test('generates BLAKE3 hash', async ({ page }) => {
    await page.locator('select').selectOption('BLAKE3');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('hello');
    await expect(output).not.toHaveValue('');
    const hash = await output.inputValue();
    expect(hash.length).toBeGreaterThanOrEqual(32);
  });
});
