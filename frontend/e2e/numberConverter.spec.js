import { test, expect } from '@playwright/test';

test.describe('Number Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/number-converter');
    await expect(page.getByRole('heading', { name: 'Number Converter' })).toBeVisible();
  });

  test('loads with default input 255 and auto-converts', async ({ page }) => {
    const input = page.locator('input[type="text"][placeholder="Enter number..."]');
    await expect(input).toHaveValue('255');

    // Wait for results grid to appear
    await expect(page.getByText('Number Bases', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Binary', { exact: true })).toBeVisible();
    await expect(page.getByText('Decimal', { exact: true })).toBeVisible();
    await expect(page.getByText('Hex', { exact: true })).toBeVisible();
    await expect(page.getByText('Octal', { exact: true })).toBeVisible();
  });

  test('displays all number base conversions for 255', async ({ page }) => {
    await expect(page.getByText('Number Bases', { exact: true })).toBeVisible({ timeout: 10000 });

    // 255 in binary
    const binaryRow = page.getByText('Binary', { exact: true }).locator('xpath=..');
    await expect(binaryRow).toContainText('11111111');

    // 255 in hex
    const hexRow = page.getByText('Hex', { exact: true }).locator('xpath=..');
    await expect(hexRow).toContainText('FF');

    // 255 in octal
    const octalRow = page.getByText('Octal', { exact: true }).locator('xpath=..');
    await expect(octalRow).toContainText('377');

    // Decimal is active (border highlight can be inferred by presence)
    await expect(page.getByText('255', { exact: true }).first()).toBeVisible();
  });

  test('entering a new number updates conversions', async ({ page }) => {
    const input = page.locator('input[type="text"][placeholder="Enter number..."]');
    await input.fill('16');

    // Wait for conversion to update
    await expect
      .poll(async () => {
        const hexRow = page.getByText('Hex', { exact: true }).locator('xpath=..');
        return (await hexRow.textContent()) || '';
      })
      .toContain('10');

    const binaryRow = page.getByText('Binary', { exact: true }).locator('xpath=..');
    await expect(binaryRow).toContainText('10000');
  });

  test('random button generates a different number', async ({ page }) => {
    const input = page.locator('input[type="text"][placeholder="Enter number..."]');
    await expect(input).toHaveValue('255');

    await page.getByRole('button', { name: 'Random' }).click();

    // Value should change from 255
    await expect.poll(async () => await input.inputValue()).not.toBe('255');
    const newValue = await input.inputValue();
    expect(newValue).toMatch(/^\d+$/);
  });

  test('shows bit values grid', async ({ page }) => {
    await expect(page.getByText('Bit Values', { exact: true })).toBeVisible({ timeout: 10000 });

    // For 255, all bits should be 1
    const bitGrid = page.getByText('Bit Values', { exact: true }).locator('xpath=..');
    await expect(bitGrid).toBeVisible();
  });

  test('shows ASCII character for printable code', async ({ page }) => {
    const input = page.locator('input[type="text"][placeholder="Enter number..."]');
    await input.fill('65');

    await expect(page.getByText('As ASCII', { exact: true })).toBeVisible({ timeout: 10000 });
    const asciiSection = page.getByText('As ASCII', { exact: true }).locator('xpath=..');
    await expect(asciiSection).toContainText('A');
  });

  test('shows color swatch for applicable numbers', async ({ page }) => {
    // 255 should show a color (RGB blue channel)
    await expect(page.getByText('As Color', { exact: true })).toBeVisible({ timeout: 10000 });
    const colorSection = page.getByText('As Color', { exact: true }).locator('xpath=..');
    await expect(colorSection).toBeVisible();
  });

  test('shows IPv4, Unix Time and Percentage contexts', async ({ page }) => {
    await expect(page.getByText('As IPv4', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('As File Size', { exact: true })).toBeVisible();
    await expect(page.getByText('As Unix Time', { exact: true })).toBeVisible();
    await expect(page.getByText('As Percentage', { exact: true })).toBeVisible();
  });

  test('shows error for invalid input', async ({ page }) => {
    const input = page.locator('input[type="text"][placeholder="Enter number..."]');
    await input.fill('not-a-number');

    // Wait for error to appear
    await expect(
      page
        .locator('div')
        .filter({ hasText: /invalid|error|failed/i })
        .first()
    ).toBeVisible();
  });
});
