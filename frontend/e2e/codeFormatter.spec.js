import { test, expect } from '@playwright/test';

test.describe('Code Formatter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-formatter');
    await expect(page.getByRole('heading', { name: 'Code Formatter' })).toBeVisible();
  });

  test('loads with JSON default and empty panes', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'JSON' }).first()).toBeVisible();
    await expect(page.locator('textarea').first()).toHaveValue('');
    await expect(page.locator('pre code')).not.toBeVisible();
    await expect(page.locator('input[placeholder=".users[].name"]')).toBeVisible();
  });

  test('load sample fills input', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Sample' }).click();

    const input = page.locator('textarea').first();
    await expect(input).not.toHaveValue('');
    await expect(input).toContainText('users');
  });

  test('format produces output', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Sample' }).click();

    const outputCode = page.locator('pre code');
    await expect(outputCode).toBeVisible();
    await expect(outputCode).not.toHaveText('');
  });

  test('minify toggle changes output', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Sample' }).click();

    const outputCode = page.locator('pre code');
    await expect(outputCode).toBeVisible();

    const formattedText = await outputCode.textContent();
    expect(formattedText).toContain('\n');

    await page.getByRole('button', { name: 'Minify' }).click();
    await page.waitForTimeout(400);

    const minifiedText = await outputCode.textContent();
    const formattedNewlines = (formattedText.match(/\n/g) || []).length;
    const minifiedNewlines = (minifiedText.match(/\n/g) || []).length;
    expect(minifiedNewlines).toBeLessThan(formattedNewlines);
  });

  test('language switch works', async ({ page }) => {
    const langButton = page
      .getByText('Language', { exact: true })
      .locator('..')
      .locator('button')
      .first();
    await langButton.click();
    await page.getByText('XML', { exact: true }).click();

    await page.getByRole('button', { name: 'Load Sample' }).click();

    const input = page.locator('textarea').first();
    await expect(input).toContainText('<?xml');
  });

  test('invalid JSON shows error', async ({ page }) => {
    const input = page.locator('textarea').first();
    await input.fill('{ invalid json }');

    await expect(page.getByText(/invalid JSON/i)).toBeVisible({ timeout: 2000 });
  });

  test('filter bar appears for JSON and XML but not CSS', async ({ page }) => {
    await expect(page.locator('input[placeholder=".users[].name"]')).toBeVisible();

    const langButton = page
      .getByText('Language', { exact: true })
      .locator('..')
      .locator('button')
      .first();

    await langButton.click();
    await page.getByText('XML', { exact: true }).click();
    await expect(page.locator('input[placeholder="//book"]')).toBeVisible();

    await langButton.click();
    await page.getByText('CSS', { exact: true }).click();
    await expect(page.locator('input[placeholder=".users[].name"]')).not.toBeVisible();
    await expect(page.locator('input[placeholder="//book"]')).not.toBeVisible();
  });

  test('output has syntax highlighting', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Sample' }).click();

    const codeBlock = page.locator('pre code');
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toHaveClass(/language-json/);
  });

  test('filter input filters JSON output', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Sample' }).click();

    const filterInput = page.locator('input[placeholder=".users[].name"]');
    await filterInput.fill('.users[].name');
    await page.waitForTimeout(500);

    const outputCode = page.locator('pre code');
    const text = await outputCode.textContent();
    expect(text).toContain('Alice');
    expect(text).toContain('Bob');
    expect(text).not.toContain('age');
    expect(text).not.toContain('count');
  });
});
