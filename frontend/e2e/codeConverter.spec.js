import { test, expect } from '@playwright/test';

test.describe('Code Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-converter');
    await expect(page.getByRole('heading', { name: 'Code Converter' })).toBeVisible();
  });

  test('loads with default method JSON ↔ YAML', async ({ page }) => {
    const select = page.locator('select');
    await expect(select).toHaveValue('JSON ↔ YAML');
    await expect(page.locator('textarea')).toHaveCount(2);
  });

  test('converts JSON to YAML', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('{"name": "test", "value": 42}');
    await expect(output).toHaveValue(/name:\s*test/);
    await expect(output).toHaveValue(/value:\s*42/);
  });

  test('converts YAML to JSON', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('name: hello\nitems:\n  - a\n  - b');
    await expect(output).toHaveValue(/\"name\":\s*\"hello\"/);
  });

  test('converts JSON to XML', async ({ page }) => {
    await page.locator('select').selectOption('JSON ↔ XML');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('{"hello": "world"}');
    await expect(output).toHaveValue(/<hello>/);
    await expect(output).toHaveValue(/world/);
  });

  test('converts XML to JSON', async ({ page }) => {
    await page.locator('select').selectOption('JSON ↔ XML');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('<root><name>test</name></root>');
    await expect(output).toHaveValue(/\"name\"/);
  });

  test('case swapping', async ({ page }) => {
    await page.locator('select').selectOption('Case Swapping');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('Hello World');
    await expect(output).toHaveValue('hELLO wORLD');
  });

  test('converts CSV to JSON', async ({ page }) => {
    await page.locator('select').selectOption('JSON ↔ CSV / TSV');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('name,age\nAlice,30\nBob,25');
    await expect(output).toHaveValue(/\"name\":\s*\"Alice\"/);
    await expect(output).toHaveValue(/\"age\":\s*\"30\"/);
  });

  test('converts CSV to TSV', async ({ page }) => {
    await page.locator('select').selectOption('CSV ↔ TSV');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('name,age\nAlice,30');
    await expect(output).toHaveValue(/name\tage/);
  });

  test('converts Key-Value to Query String', async ({ page }) => {
    await page.locator('select').selectOption('Key-Value ↔ Query String');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('foo=bar\nbaz=qux');
    await expect(output).not.toHaveValue('');
    const value = await output.inputValue();
    expect(value).toContain('baz=qux');
    expect(value).toContain('foo=bar');
  });

  test('converts Properties to JSON', async ({ page }) => {
    await page.locator('select').selectOption('Properties ↔ JSON');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('app.name=MyApp\napp.version=1.0');
    await expect(output).toHaveValue(/\"app.name\":\s*\"MyApp\"/);
  });

  test('converts INI to JSON', async ({ page }) => {
    await page.locator('select').selectOption('INI ↔ JSON');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('[section]\nkey=value');
    await expect(output).toHaveValue(/\"section\"/);
    await expect(output).toHaveValue(/\"key\":\s*\"value\"/);
  });

  test('converts curl to fetch', async ({ page }) => {
    await page.locator('select').selectOption('CURL ↔ Fetch');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill(
      'curl -X POST https://api.example.com/data -H \'Content-Type: application/json\' -d \'{"key":"value"}\''
    );
    await expect(output).toHaveValue(/fetch\(/);
    await expect(output).toHaveValue(/method:\s*'POST'/);
  });

  test('converts cron expression to text', async ({ page }) => {
    await page.locator('select').selectOption('Cron ↔ Text');
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('0 9 * * 1');
    await expect(output).toHaveValue(/Monday/);
  });

  test('shows error for invalid JSON with YAML method', async ({ page }) => {
    const input = page.locator('textarea').first();
    await input.fill('not valid json');
    // Error should appear in the output pane (border turns red)
    const outputPane = page.locator('textarea').nth(1);
    await expect(outputPane).toHaveValue('');
  });

  test('clears output when input is cleared', async ({ page }) => {
    const input = page.locator('textarea').first();
    const output = page.locator('textarea').nth(1);

    await input.fill('{"test": true}');
    await expect(output).not.toHaveValue('');

    await input.fill('');
    await expect(output).toHaveValue('');
  });

  test('layout toggle switches between horizontal and vertical', async ({ page }) => {
    const splitPane = page.locator('div[style*="grid-template-columns"]');

    // Default is horizontal (2 columns)
    const initialStyle = await splitPane.getAttribute('style');
    expect(initialStyle).toContain('1fr 1fr');

    // Find the layout toggle button (second button with SVG in main content, not modal)
    const mainContent = page.locator('div').filter({ hasText: 'Code Converter' }).first();
    const toggleButton = mainContent
      .locator('button')
      .filter({ has: page.locator('svg') })
      .nth(1);
    await toggleButton.click();

    // After toggle should be vertical (1 column)
    await expect(splitPane).toHaveAttribute('style', /1fr;/);
  });

  test('copy button copies output to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const input = page.locator('textarea').first();
    await input.fill('{"copied": true}');

    const copyButton = page.locator('button[title="Copy to clipboard"]').first();
    await copyButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('copied');
  });
});
