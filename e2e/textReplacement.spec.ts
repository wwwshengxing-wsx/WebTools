import { Buffer } from 'node:buffer';
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
    buffer: Buffer.from(plistFixture, 'utf-8'),
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

  const stream = await download.createReadStream();
  if (stream) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const xmlContent = Buffer.concat(chunks).toString('utf-8');
    expect(xmlContent).toContain('<string>alpha</string>');
    expect(xmlContent).not.toContain('gamma');
  } else {
    const path = await download.path();
    expect(path).toBeTruthy();
  }
});
