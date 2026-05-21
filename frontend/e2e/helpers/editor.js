import { expect } from '@playwright/test';

export const editor = (page, testId) => page.getByTestId(testId);
export const editorContent = (page, testId) => page.getByTestId(`${testId}-content`);

async function editableTag(locator) {
  return locator.evaluate((el) => el.tagName.toLowerCase());
}

export async function fillEditor(page, testId, value) {
  const content = editorContent(page, testId);
  await expect(content).toBeVisible();

  const tag = await editableTag(content);
  if (tag === 'textarea' || tag === 'input') {
    await content.fill(value);
    return;
  }

  await content.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.press('Backspace');
  if (value) {
    await page.keyboard.type(value);
  }
}

export async function readEditorText(page, testId) {
  const content = editorContent(page, testId);
  await expect(content).toBeVisible();

  const tag = await editableTag(content);
  if (tag === 'textarea' || tag === 'input') {
    return content.inputValue();
  }

  return content
    .locator('.cm-line')
    .evaluateAll((lines) => lines.map((line) => line.textContent ?? '').join('\n'));
}

export async function expectEditorText(page, testId, expected) {
  if (expected instanceof RegExp) {
    await expect.poll(() => readEditorText(page, testId)).toMatch(expected);
    return;
  }

  await expect.poll(() => readEditorText(page, testId)).toBe(expected);
}

export async function expectEditorContains(page, testId, expected) {
  if (expected instanceof RegExp) {
    await expect.poll(() => readEditorText(page, testId)).toMatch(expected);
    return;
  }

  await expect.poll(() => readEditorText(page, testId)).toContain(expected);
}

export async function expectEditorNotEmpty(page, testId) {
  await expect.poll(async () => (await readEditorText(page, testId)).trim()).not.toBe('');
}
