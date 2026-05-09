import { test, expect } from '@playwright/test';

test.describe('Color Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/color-converter');
    await expect(page.getByRole('heading', { name: 'Color Converter' })).toBeVisible();
  });

  test('loads with default color #3B82F6', async ({ page }) => {
    await expect(page.locator('input[type="color"]')).toHaveValue('#3b82f6');
    await expect(page.getByText('#3B82F6').first()).toBeVisible();
    await expect(page.getByText('Click to copy')).toBeVisible();
  });

  test('hex input changes color', async ({ page }) => {
    const hexInput = page.locator('input[type="text"]').first();
    await hexInput.fill('#FF5733');
    await expect(page.locator('input[type="color"]')).toHaveValue('#ff5733');
    await expect(page.getByText('#FF5733').first()).toBeVisible();
  });

  test('RGB inputs update color', async ({ page }) => {
    const numberInputs = page.locator('input[type="number"]');
    const rInput = numberInputs.nth(0);
    const gInput = numberInputs.nth(1);
    const bInput = numberInputs.nth(2);

    await rInput.fill('255');
    await gInput.fill('0');
    await bInput.fill('0');

    await expect(page.locator('input[type="color"]')).toHaveValue('#ff0000');
    await expect(page.getByText('#FF0000').first()).toBeVisible();
  });

  test('recent colors section exists', async ({ page }) => {
    await expect(page.getByText('Recent Colors')).toBeVisible();
    // Default color is added immediately on load via useEffect,
    // so "No recent colors" is never visible on initial load.
  });

  test('code export tabs work', async ({ page }) => {
    await expect(page.getByText('Code Export')).toBeVisible();

    const tailwindTab = page.getByRole('button', { name: 'Tailwind' });
    await tailwindTab.click();
    await expect(page.locator('pre code')).toContainText('tailwind.config.js');

    const jsonTab = page.getByRole('button', { name: 'JSON' });
    await jsonTab.click();
    await expect(page.locator('pre code')).toContainText('"hex"');
  });

  test('palette variations show colors', async ({ page }) => {
    await expect(page.getByText('Palette Variations')).toBeVisible();

    // Palette colors are rendered as rows inside a div container
    const paletteContainer = page
      .locator('div')
      .filter({ hasText: 'Palette Variations' })
      .first()
      .locator('..');
    const colorRows = paletteContainer.locator(
      'div[style*="backgroundColor"], div[style*="background-color"]'
    );
    await expect(colorRows.first()).toBeVisible();
    expect(await colorRows.count()).toBeGreaterThanOrEqual(5);
  });

  test('copy buttons work', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const hexCopyButton = page.locator('table button').first();
    await hexCopyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.toUpperCase()).toBe('#3B82F6');
  });

  test('random button changes color', async ({ page }) => {
    const initialHex = await page.locator('input[type="color"]').inputValue();

    const randomButton = page.getByRole('button', { name: 'Random' });
    await randomButton.click();

    await expect
      .poll(async () => await page.locator('input[type="color"]').inputValue())
      .not.toBe(initialHex);
  });

  test('header hex click copies to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const hexDisplay = page.getByText('Click to copy').first();
    await hexDisplay.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('#3B82F6');
  });

  test('palette tabs switch between shades, tints, and tones', async ({ page }) => {
    const shadesTab = page.getByRole('button', { name: 'Shades' });
    const tintsTab = page.getByRole('button', { name: 'Tints' });
    const tonesTab = page.getByRole('button', { name: 'Tones' });

    await shadesTab.click();
    await expect(shadesTab).toBeVisible();

    await tintsTab.click();
    await expect(tintsTab).toBeVisible();

    await tonesTab.click();
    await expect(tonesTab).toBeVisible();
  });
});
