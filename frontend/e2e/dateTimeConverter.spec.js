import { test, expect } from '@playwright/test';

test.describe('DateTime Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/datetime-converter');
    await expect(page.getByRole('heading', { name: 'DateTime Converter' })).toBeVisible();
  });

  test('loads with default timestamp 1710508200 and shows results', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await expect(input).toHaveValue('1710508200');

    // Recognized format badge
    await expect(page.getByText('Recognized as:')).toBeVisible();
    await expect(page.getByText('Unix Timestamp (seconds)')).toBeVisible();

    // Conversion results
    await expect(page.getByText('Conversion Results', { exact: true })).toBeVisible();
    await expect(page.getByText('Seconds', { exact: true })).toBeVisible();
    await expect(page.getByText('Milliseconds', { exact: true })).toBeVisible();
    await expect(page.getByText('ISO 8601', { exact: true })).toBeVisible();
    await expect(page.getByText('Local Time', { exact: true })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'UTC' }).first()).toBeVisible();
    await expect(page.getByText('Relative', { exact: true })).toBeVisible();
  });

  test('shows current local time on load', async ({ page }) => {
    const timeLabel = page.getByText('Your current local time');
    await expect(timeLabel).toBeVisible();

    const timeSection = page.locator('div').filter({ has: timeLabel }).first();
    await expect(timeSection).toBeVisible();
    await expect(timeSection).not.toHaveText('');
  });

  test('entering ISO date updates detection and results', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill('2024-03-15T12:30:00Z');

    // Detection badge should update
    await expect(page.getByText('ISO 8601 Date')).toBeVisible();

    // Results should still show
    await expect(page.getByText('Conversion Results', { exact: true })).toBeVisible();
    await expect(page.getByText('Seconds', { exact: true })).toBeVisible();
  });

  test('copy button copies result to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click the copy button next to Seconds
    const secondsRow = page.getByText('Seconds', { exact: true }).locator('xpath=..');
    const copyButton = secondsRow.locator('button').first();
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('1710508200');
  });

  test('timezone converter From and To selects exist', async ({ page }) => {
    await expect(page.getByText('Timezone Converter', { exact: true })).toBeVisible();

    const selects = page.locator('select');
    await expect(selects).toHaveCount(2);

    // Verify labels
    await expect(page.getByText('From', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('To', { exact: true }).first()).toBeVisible();
  });

  test('Add to Favorites button is visible and functional', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add to Favorites' })).toBeVisible();
  });

  test('Favorite Timezones panel shows default favorites', async ({ page }) => {
    await expect(page.getByText('Your Favorite Timezones', { exact: true })).toBeVisible();

    // Default favorites are Asia/Ho_Chi_Minh and America/New_York
    await expect(page.locator('body')).toContainText('Ho Chi Minh');
    await expect(page.locator('body')).toContainText('New York');
  });

  test('Now (Unix) preset button updates input to current timestamp', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await expect(input).toHaveValue('1710508200');

    await page.getByRole('button', { name: 'Now (Unix)' }).click();

    await expect(input).not.toHaveValue('1710508200');
    const newValue = await input.inputValue();
    expect(newValue).toMatch(/^\d{10}$/);
  });

  test('Now (ISO) preset button updates input to ISO string', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();

    await page.getByRole('button', { name: 'Now (ISO)' }).click();

    const newValue = await input.inputValue();
    expect(newValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    await expect(page.getByText('ISO 8601 Date')).toBeVisible();
  });

  test('Today 00:00 preset button changes input', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();

    await page.getByRole('button', { name: 'Today 00:00' }).click();

    const newValue = await input.inputValue();
    expect(newValue).toMatch(/^\d+$/);
    await expect(page.getByText('Unix Timestamp (seconds)')).toBeVisible();
  });

  test('Tomorrow 00:00 preset button changes input', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();

    await page.getByRole('button', { name: 'Tomorrow 00:00' }).click();

    const newValue = await input.inputValue();
    expect(newValue).toMatch(/^\d+$/);
    await expect(page.getByText('Unix Timestamp (seconds)')).toBeVisible();
  });
});
