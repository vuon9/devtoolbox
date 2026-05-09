import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-encoder');
  });

  async function setDarkMode(page) {
    await page.evaluate(() => {
      localStorage.setItem('dt-mode', 'dark');
      localStorage.setItem('dt-name', 'github-dark');
    });
  }

  async function setLightMode(page) {
    await page.evaluate(() => {
      localStorage.setItem('dt-mode', 'light');
      localStorage.setItem('dt-name', 'github-light');
    });
  }

  test('default — system mode', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('dt-mode');
      localStorage.removeItem('dt-name');
    });
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
    await page.waitForTimeout(100);

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(false);
  });

  test('switch to dark mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('dark', { exact: true }).click();
    await page.waitForTimeout(100);

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  test('theme persists across reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('dark', { exact: true }).click();
    await page.waitForTimeout(100);

    await page.reload();
    await page.goto('/tool/code-encoder');

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  async function pickGalleryTheme(page, themeName) {
    await page.getByRole('dialog').getByRole('combobox').click();
    await page.getByRole('option', { name: themeName }).click();
  }

  test('theme dropdown contains gallery themes', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    await page.getByRole('dialog').getByRole('combobox').click();

    // allThemes includes built-in + gallery
    const optionTexts = await page.getByRole('option').allTextContents();
    const expected = [
      'GitHub Dark', 'GitHub Light',
      'One Dark Pro', 'Dracula', 'Nord',
      'Catppuccin Mocha', 'Solarized Dark', 'Solarized Light',
    ];
    for (const theme of expected) {
      expect(optionTexts.some((t) => t.includes(theme))).toBeTruthy();
    }
  });

  test('select gallery theme applies colors', async ({ page }) => {
    await setDarkMode(page);
    await page.reload();
    await page.goto('/tool/code-encoder');

    await page.getByRole('button', { name: 'Settings' }).first().click();
    await pickGalleryTheme(page, 'One Dark Pro');
    await page.waitForTimeout(100);

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    expect(bg).toBe('#282c34');
  });

  test('gallery theme persists across reload', async ({ page }) => {
    await setDarkMode(page);
    await page.reload();
    await page.goto('/tool/code-encoder');

    await page.getByRole('button', { name: 'Settings' }).first().click();
    await pickGalleryTheme(page, 'Dracula');
    await page.waitForTimeout(100);

    await page.reload();
    await page.goto('/tool/code-encoder');

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    expect(bg).toBe('#282a36');
  });

  test('switch from gallery to built-in clears overrides', async ({ page }) => {
    await setDarkMode(page);
    await page.reload();
    await page.goto('/tool/code-encoder');

    await page.getByRole('button', { name: 'Settings' }).first().click();
    await pickGalleryTheme(page, 'Nord');
    await page.waitForTimeout(100);

    // Select a built-in theme from the dropdown (clears JS overrides)
    await page.getByRole('dialog').getByRole('combobox').click();
    await page.getByRole('option', { name: 'GitHub Light' }).click();
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
