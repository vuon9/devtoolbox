import { test, expect } from '@playwright/test';

test.describe('Data Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/data-generator');
    await expect(page.getByRole('heading', { name: 'Data Generator' })).toBeVisible();
  });

  test('loads with default schema and empty output', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'JSON' })).toBeVisible();
    await expect(page.locator('input[type="number"]').first()).toHaveValue('10');
    await expect(page.locator('input[placeholder="Field name"]')).toHaveCount(5);
    await expect(page.locator('input[placeholder="Field name"]').first()).toHaveValue('id');

    const output = page.locator('textarea[readonly]');
    await expect(output).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Copy to Clipboard' })).not.toBeVisible();
  });

  test('generate button produces output', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate' }).click();

    const output = page.locator('textarea[readonly]');
    await expect(output).not.toHaveValue('');
    await expect(output).not.toHaveValue('Generated data will appear here...');
  });

  test('output is valid JSON when format is JSON', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate' }).click();

    const output = page.locator('textarea[readonly]');
    await expect(output).not.toHaveValue('');

    const text = await output.inputValue();
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(10);
  });

  test('format selection changes output format', async ({ page }) => {
    await page.getByRole('button', { name: 'JSON' }).click();
    await page.getByText('CSV', { exact: true }).click();

    await page.getByRole('button', { name: 'Generate' }).click();

    const output = page.locator('textarea[readonly]');
    await expect(output).not.toHaveValue('');

    const text = await output.inputValue();
    expect(text).toContain(',');
    expect(text).not.toContain('[');
  });

  test('add field increases schema count', async ({ page }) => {
    await expect(page.locator('input[placeholder="Field name"]')).toHaveCount(5);

    await page.getByRole('button', { name: 'Add Field' }).click();
    await expect(page.locator('input[placeholder="Field name"]')).toHaveCount(6);
  });

  test('remove field decreases schema count', async ({ page }) => {
    await expect(page.locator('input[placeholder="Field name"]')).toHaveCount(5);

    const firstField = page.locator('input[placeholder="Field name"]').first();
    const removeButton = firstField.locator('..').locator('button').last();
    await removeButton.click();

    await expect(page.locator('input[placeholder="Field name"]')).toHaveCount(4);
  });

  test('copy button copies output to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByRole('button', { name: 'Generate' }).click();
    const output = page.locator('textarea[readonly]');
    await expect(output).not.toHaveValue('');

    await expect(page.getByRole('button', { name: 'Copy to Clipboard' })).toBeVisible();
    await page.getByRole('button', { name: 'Copy to Clipboard' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const outputText = await output.inputValue();
    expect(clipboardText).toBe(outputText);
  });

  test('help modal opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click();
    await expect(page.getByRole('heading', { name: 'Documentation & Help' })).toBeVisible();

    await page
      .getByRole('heading', { name: 'Documentation & Help' })
      .locator('..')
      .locator('button')
      .click();
    await expect(page.getByRole('heading', { name: 'Documentation & Help' })).not.toBeVisible();
  });

  test('layout toggle switches orientation', async ({ page }) => {
    const splitPane = page.locator('div[style*="grid-template-columns"]');
    const initialStyle = await splitPane.getAttribute('style');
    expect(initialStyle).toContain('1fr 1fr');

    const controlsDiv = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: 'Generate' }) })
      .filter({ has: page.getByRole('button', { name: 'Help' }) })
      .last();
    const layoutToggle = controlsDiv
      .locator('button')
      .filter({ has: page.locator('svg') })
      .filter({ hasText: '' })
      .last();
    await layoutToggle.click();

    await expect(splitPane).toHaveAttribute('style', /1fr;/);
  });
});
