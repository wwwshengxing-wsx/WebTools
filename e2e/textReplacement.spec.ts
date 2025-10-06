import type { Readable } from 'stream';
import { expect, test } from '@playwright/test';

const plistFixture = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>
  <dict>
    <key>phrase</key>
    <string>Alpha updated</string>
    <key>shortcut</key>
    <string>alpha</string>
  </dict>
  <dict>
    <key>phrase</key>
    <string>Gamma addition</string>
    <key>shortcut</key>
    <string>gamma</string>
  </dict>
</array>
</plist>`;

async function readStreamAsUtf8(stream: Readable): Promise<string> {
  const decoder = new TextDecoder();
  let result = '';

  for await (const chunk of stream as AsyncIterable<Uint8Array | string>) {
    if (typeof chunk === 'string') {
      result += chunk;
    } else if (chunk instanceof Uint8Array) {
      result += decoder.decode(chunk, { stream: true });
    } else {
      throw new Error('Unexpected stream chunk type');
    }
  }

  return result + decoder.decode();
}

function assertReadableStream(value: unknown): asserts value is Readable {
  if (value == null || typeof value !== 'object') {
    throw new Error('Expected a readable stream');
  }

  const candidate = value as AsyncIterable<unknown>;
  if (typeof candidate[Symbol.asyncIterator] !== 'function') {
    throw new Error('Expected a readable stream');
  }
}

test('text replacement workflow with import, history, and export', async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Text Replacement' })
    .click();
  await expect(page.getByRole('heading', { name: 'Text Replacement Manager' })).toBeVisible();
  await expect(page.getByText('No entries yet')).toBeVisible();

  await page.getByRole('button', { name: 'New entry' }).click();
  await page.getByRole('textbox', { name: 'Shortcut' }).fill('alpha');
  await page.getByRole('textbox', { name: 'Phrase' }).fill('Alpha phrase');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('cell', { name: 'alpha', exact: true })).toBeVisible();

  const searchBox = page.getByPlaceholder('Search shortcut or phrase');
  await searchBox.fill('zzz');
  await expect(page.getByText('No entries yet')).toBeVisible();
  await searchBox.fill('alpha');
  await expect(page.getByRole('cell', { name: 'alpha', exact: true })).toBeVisible();
  await searchBox.fill('');

  const importInput = page.getByLabel('Import XML file');
  await importInput.setInputFiles({
    name: 'import.xml',
    mimeType: 'text/xml',
    buffer: plistFixture,
  });

  await expect(page.getByRole('heading', { name: 'Import preview' })).toBeVisible();
  await expect(page.getByText('Review 2 entries found in import.xml.')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm import' }).click();
  await expect(page.getByRole('heading', { name: 'Import preview' })).toHaveCount(0);

  await expect(page.getByRole('cell', { name: 'gamma', exact: true })).toBeVisible();
  await expect(
    page.getByText('Imported 2 entries from import.xml', { exact: false })
  ).toBeVisible();

  const firstUndoButton = page.getByRole('button', { name: 'Undo' }).first();
  await firstUndoButton.click();
  await expect(page.getByText('Reverted import change').first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'gamma', exact: true })).toHaveCount(0);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('TextReplacement_export.xml');

  const streamResult: unknown = await download.createReadStream();
  assertReadableStream(streamResult);

  const xmlContent = await readStreamAsUtf8(streamResult);
  expect(xmlContent).toContain('<string>alpha</string>');
  expect(xmlContent).not.toContain('gamma');
});
