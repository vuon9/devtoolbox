import { test, expect } from '@playwright/test';

test.describe('Text Diff Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/diff');
    await expect(page.getByRole('heading', { name: 'Text Diff' })).toBeVisible();
  });

  test('loads in edit mode with two empty textareas', async ({ page }) => {
    const textareas = page.locator('textarea');
    await expect(textareas).toHaveCount(2);

    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);
    await expect(original).toHaveValue('');
    await expect(modified).toHaveValue('');

    // Labels should be visible
    await expect(page.getByText('Original Text', { exact: true })).toBeVisible();
    await expect(page.getByText('Modified Text', { exact: true })).toBeVisible();
  });

  test('entering text in both panes preserves values', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('Line one\nLine two');
    await modified.fill('Line one\nLine three');

    await expect(original).toHaveValue('Line one\nLine two');
    await expect(modified).toHaveValue('Line one\nLine three');
  });

  test('switching to diff mode shows differences', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('apple\nbanana');
    await modified.fill('apple\ncherry');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();

    // Diff view should render
    await expect(page.getByText('Original', { exact: true })).toBeVisible();
    await expect(page.getByText('Modified', { exact: true })).toBeVisible();
  });

  test('split view shows two panes', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('A\nB');
    await modified.fill('A\nC');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();

    // Default view is split
    await expect(page.getByText('Original', { exact: true })).toBeVisible();
    await expect(page.getByText('Modified', { exact: true })).toBeVisible();
  });

  test('unified view shows single pane with prefixes', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('A\nB');
    await modified.fill('A\nC');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();
    await page.getByRole('button', { name: 'Unified', exact: true }).click();

    // Unified pane should show + and - prefixes
    await expect(page.getByText('-B').first()).toBeVisible();
    await expect(page.getByText('+C').first()).toBeVisible();
  });

  test('added lines are green in diff view', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('apple');
    await modified.fill('apple\nbanana');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();

    // Target the diff line by its unique added-line background color
    const addedLine = page
      .locator('div[style*="background-color: rgba(34, 197, 94, 0.15)"]')
      .filter({ hasText: 'banana' })
      .first();
    await expect(addedLine).toBeVisible();
    // Check green border color
    await expect(addedLine).toHaveCSS('border-left-color', 'rgb(34, 197, 94)');
  });

  test('removed lines are red in diff view', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('apple\nbanana');
    await modified.fill('apple');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();

    // Target the diff line by its unique removed-line background color
    const removedLine = page
      .locator('div[style*="background-color: rgba(239, 68, 68, 0.15)"]')
      .filter({ hasText: 'banana' })
      .first();
    await expect(removedLine).toBeVisible();
    await expect(removedLine).toHaveCSS('border-left-color', 'rgb(239, 68, 68)');
  });

  test('reset button clears both texts', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('some original text');
    await modified.fill('some modified text');

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(original).toHaveValue('');
    await expect(modified).toHaveValue('');
  });

  test('diff mode toggle changes granularity', async ({ page }) => {
    const original = page.locator('textarea').first();
    const modified = page.locator('textarea').nth(1);

    await original.fill('The quick brown fox');
    await modified.fill('The slow brown fox');

    await page.getByRole('button', { name: 'Diff', exact: true }).click();

    // Default is Lines; switch to Words
    await page.getByRole('button', { name: 'Words', exact: true }).click();

    // In word-level diff, the changed word should appear as a removed line
    const diffContainer = page
      .locator('div[style*="background-color: rgba(239, 68, 68, 0.15)"]')
      .filter({ hasText: 'quick' })
      .first();
    await expect(diffContainer).toBeVisible();

    // Switch to Chars
    await page.getByRole('button', { name: 'Chars', exact: true }).click();
    // Verify diff view is still rendering
    await expect(page.getByText('Original', { exact: true })).toBeVisible();
    await expect(page.getByText('Modified', { exact: true })).toBeVisible();
  });
});
