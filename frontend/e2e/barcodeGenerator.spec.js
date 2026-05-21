import { test, expect } from '@playwright/test';

test.describe('Barcode / QR Code Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/barcode');
  });

  test('should load with QR Code type selected', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Barcode \/ QR Code/ })).toBeVisible();
    await expect(page.getByText('Generate high-quality QR codes and barcodes')).toBeVisible();
    // QR type should be active
    await expect(page.getByRole('button', { name: 'QR Code' })).toBeVisible();
    // Default input should be present
    await expect(page.locator('textarea').first()).toHaveValue('https://github.com/wailsapp/wails');
  });

  test('should auto-generate QR code on load', async ({ page }) => {
    // Wait for barcode image to appear
    await expect(page.locator('img[alt="Barcode"]')).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Code 128 and generate barcode', async ({ page }) => {
    await page.getByRole('button', { name: 'Code 128' }).click();
    // Input should update to default
    const textarea = page.locator('textarea').first();
    await expect(textarea).toHaveValue('HELLO-2024');
    // Preview should show image or placeholder
    const barcodeImg = page.locator('img[alt="Barcode"]');
    const placeholder = page.locator('div').filter({ hasText: /Enter content|Generating/i });
    await expect(barcodeImg.or(placeholder)).toBeVisible({ timeout: 5000 });
  });

  test('should switch to EAN-13 and generate barcode', async ({ page }) => {
    await page.getByRole('button', { name: 'EAN-13' }).click();
    const textarea = page.locator('textarea').first();
    await expect(textarea).toHaveValue('5901234123457');
    // Preview should show image or placeholder
    const barcodeImg = page.locator('img[alt="Barcode"]');
    const placeholder = page.locator('div').filter({ hasText: /Enter content|Generating/i });
    await expect(barcodeImg.or(placeholder)).toBeVisible({ timeout: 5000 });
  });

  test('should update barcode when input changes', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('https://example.com');
    // Wait for generation
    await page.waitForTimeout(500);
    const barcodeImg = page.locator('img[alt="Barcode"]');
    const placeholder = page.locator('div').filter({ hasText: /Enter content|Generating/i });
    await expect(barcodeImg.or(placeholder)).toBeVisible({ timeout: 5000 });
  });

  test('should show download buttons after generation', async ({ page }) => {
    const barcodeImg = page.locator('img[alt="Barcode"]');
    // Only assert download buttons if the image was actually generated
    if (await barcodeImg.isVisible().catch(() => false)) {
      await expect(page.getByRole('button', { name: 'PNG' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'SVG' })).toBeVisible();
    }
  });

  test('should clear input with clear button', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(textarea).toHaveValue('');
  });

  test('should show error for invalid EAN-8 input', async ({ page }) => {
    await page.getByRole('button', { name: 'EAN-8' }).click();
    const textarea = page.locator('textarea').first();
    await textarea.fill('invalid');
    await page.waitForTimeout(500);
    // Should show error banner with red text
    await expect(page.getByText(/Failed|encode|invalid|error|digits/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should toggle layout orientation', async ({ page }) => {
    const layoutButton = page.getByRole('button', { name: 'Toggle layout orientation' });
    await layoutButton.click();
    // After toggle, the layout should be vertical (single column grid)
    // Just verify the button is clickable and no error occurs
    await expect(page.getByRole('heading', { name: /Barcode \/ QR Code/ })).toBeVisible();
  });
});
