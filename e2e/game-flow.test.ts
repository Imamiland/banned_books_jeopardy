import { expect, test } from '@playwright/test';

test('game board renders 5 categories and 25 tiles', async ({ page }) => {
  await page.goto('/demo');

  await expect(page.locator('h1')).toHaveText('Banned Books Trivia');

  const categories = page.locator('h2');
  await expect(categories).toHaveCount(5);

  const tiles = page.locator('button[aria-label]');
  await expect(tiles).toHaveCount(25);
});

test('clicking a tile opens the question modal and reveals the answer', async ({ page }) => {
  await page.goto('/demo');

  const firstTile = page.getByRole('button', { name: '100 point question' }).first();
  await firstTile.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('This 1960 novel by Harper Lee features Scout Finch');

  await page.getByRole('button', { name: 'Reveal Answer' }).click();

  await expect(dialog).toContainText('What is To Kill a Mockingbird?');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});

test('continuing after reveal marks the tile answered', async ({ page }) => {
  await page.goto('/demo');

  const firstTile = page.getByRole('button', { name: '100 point question' }).first();
  await firstTile.click();
  await page.getByRole('button', { name: 'Reveal Answer' }).click();

  await expect(page.getByRole('dialog')).toContainText('What is To Kill a Mockingbird?');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'What is To Kill a Mockingbird?' })).toBeDisabled();
});
