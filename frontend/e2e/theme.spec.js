import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-encoder');
  });

  test('default — system mode', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('themeMode'));
    await page.reload();
    await page.goto('/tool/code-encoder');

    await page.getByRole('button', { name: 'Settings' }).first().click();
    await expect(page.getByText('system', { exact: true })).toBeVisible();

    const prefersDark = await page.evaluate(
      () => window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(prefersDark);
  });

  test('switch to light mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('light', { exact: true }).click();

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(false);
  });

  test('switch to dark mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('dark', { exact: true }).click();

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  test('theme persists across reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('dark', { exact: true }).click();

    await page.reload();
    await page.goto('/tool/code-encoder');

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  test('theme dropdown contains gallery themes', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Scope select to the dialog content (Radix Portal renders at end of body)
    const select = page.getByRole('dialog').locator('select');
    await expect(select).toBeVisible();

    const options = await select.locator('option').evaluateAll(list =>
      list.map(o => ({ value: o.value, text: o.textContent }))
    );

    const expected = [
      'One Dark Pro',
      'Dracula',
      'Nord',
      'Catppuccin Mocha',
      'Solarized Dark',
      'Solarized Light',
    ];
    for (const theme of expected) {
      expect(options.some((o) => o.text.includes(theme))).toBeTruthy();
    }
  });

  test('select gallery theme applies colors', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    const select = page.getByRole('dialog').locator('select');
    await expect(select.locator('option[value="one-dark-pro"]')).toBeAttached();
    await select.selectOption('one-dark-pro');
    await page.waitForTimeout(100);

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    expect(bg).toBe('#282c34');
  });

  test('gallery theme persists across reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    const select = page.getByRole('dialog').locator('select');
    await expect(select.locator('option[value="dracula"]')).toBeAttached();
    await select.selectOption('dracula');
    await page.waitForTimeout(100);

    await page.reload();
    await page.goto('/tool/code-encoder');

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    expect(bg).toBe('#282a36');
  });

  test('switch from gallery to built-in clears overrides', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    const select = page.getByRole('dialog').locator('select');
    await expect(select.locator('option[value="nord"]')).toBeAttached();
    await select.selectOption('nord');
    await page.waitForTimeout(100);

    await page.getByText('light', { exact: true }).click();
    await page.waitForTimeout(100);

    const inlineOverride = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--background')
    );
    expect(inlineOverride).toBe('');
  });

  test('settings modal opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await expect(page.getByText('Application Settings')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Application Settings')).not.toBeVisible();
  });
});
