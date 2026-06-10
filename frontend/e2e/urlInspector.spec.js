import { test, expect } from '@playwright/test';

async function gotoUrlInspector(page) {
  await page.goto('/tool/url-inspector');
  await page.waitForLoadState('networkidle');
}

function builtUrlOutput(page) {
  return page.locator('section').filter({ hasText: 'Built URL' }).locator('pre');
}

test.describe('URL Inspector', () => {
  test('loads sample URL and rebuilds it', async ({ page }) => {
    await gotoUrlInspector(page);

    await expect(page.getByRole('heading', { name: 'URL Inspector' })).toBeVisible();
    await expect(page.getByLabel('URL')).toHaveValue(
      'https://example.com:8443/api/search?q=hello%20world&debug=true#results'
    );
    await expect(page.getByLabel('Scheme')).toHaveValue('https');
    await expect(page.getByLabel('Host')).toHaveValue('example.com:8443');
    await expect(page.getByLabel('Path')).toHaveValue('/api/search');
    await expect(page.getByLabel('Hash')).toHaveValue('results');
    await expect(builtUrlOutput(page)).toContainText(
      'https://example.com:8443/api/search?q=hello+world&debug=true#results'
    );
  });

  test('parses pasted URL and sorts query parameters', async ({ page }) => {
    await gotoUrlInspector(page);

    await page.getByLabel('URL').fill('https://example.test/docs?z=last&a=two&a=one#top%20section');

    await expect(page.getByLabel('Host')).toHaveValue('example.test');
    await expect(page.getByLabel('Path')).toHaveValue('/docs');
    await expect(page.getByLabel('Hash')).toHaveValue('top section');

    await page.getByRole('button', { name: 'Sort' }).click();

    await expect(page.getByLabel('Query key').nth(0)).toHaveValue('a');
    await expect(page.getByLabel('Query value').nth(0)).toHaveValue('one');
    await expect(page.getByLabel('Query key').nth(1)).toHaveValue('a');
    await expect(page.getByLabel('Query value').nth(1)).toHaveValue('two');
    await expect(page.getByLabel('Query key').nth(2)).toHaveValue('z');
    await expect(builtUrlOutput(page)).toContainText(
      'https://example.test/docs?a=one&a=two&z=last#top%20section'
    );
  });

  test('shows validation error for relative URL input', async ({ page }) => {
    await gotoUrlInspector(page);

    await page.getByLabel('URL').fill('/docs?query=true');

    await expect(page.getByRole('alert')).toContainText('Enter an absolute URL');
    await expect(builtUrlOutput(page)).toContainText(
      'https://example.com:8443/api/search?q=hello+world&debug=true#results'
    );
  });

  test('copy button writes rebuilt URL to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoUrlInspector(page);

    await page.getByLabel('URL').fill('https://example.test/path?q=copy%20me');
    await page.getByRole('button', { name: 'Copy' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('https://example.test/path?q=copy+me');
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  });
});
