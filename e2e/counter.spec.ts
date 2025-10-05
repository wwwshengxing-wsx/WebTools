import { test, expect } from '@playwright/test';

test.describe('Counter SPA', () => {
  test('increments, decrements, and resets via the UI', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Counter' }).click();

    const counterValue = page.getByRole('status', { name: 'Counter value' });
    const incrementButton = page.getByRole('button', { name: '+1' });
    const decrementButton = page.getByRole('button', { name: '-1' });
    const resetButton = page.getByRole('button', { name: 'Reset' });

    await expect(counterValue).toHaveText('0');

    await incrementButton.click();
    await incrementButton.click();
    await decrementButton.click();
    await expect(counterValue).toHaveText('1');

    await resetButton.click();
    await expect(counterValue).toHaveText('0');

    await decrementButton.click();
    await expect(counterValue).toHaveText('-1');
  });
});
