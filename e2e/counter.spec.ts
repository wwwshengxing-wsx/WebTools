import { test, expect } from '@playwright/test';

test.describe('Counter SPA', () => {
  test('increments, decrements, and resets via the UI', async ({ page }) => {
    await page.goto('/');

    await test.step('Navigate to the counter page', async () => {
      await expect(page.getByRole('heading', { name: 'Feature Directory' })).toBeVisible();
      const primaryNavigation = page.getByRole('navigation', { name: 'Primary' });
      await primaryNavigation.getByRole('link', { name: 'Counter' }).click();
      await expect(page).toHaveURL(/\/counter$/);
      await expect(page.getByRole('heading', { name: 'Interactive Counter' })).toBeVisible();
    });

    const counterValue = page.getByRole('status', { name: 'Counter value' });
    const incrementButton = page.getByRole('button', { name: '+1' });
    const decrementButton = page.getByRole('button', { name: '-1' });
    const resetButton = page.getByRole('button', { name: 'Reset' });

    await expect(counterValue).toHaveText('0');
    await expect(counterValue).toHaveAttribute('aria-live', 'polite');

    await test.step('Adjust the counter value through the controls', async () => {
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
});
