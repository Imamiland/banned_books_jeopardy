import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/auth/callback?role=administrator');
}

test('unauthenticated users are redirected away from the admin board editor', async ({ page }) => {
  await page.goto('/admin/boards/new');

  await expect(page).toHaveURL('/');
});

test('administrator can create a board and land on its edit page', async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto('/admin/boards/new');
  await expect(page.getByRole('heading', { name: 'New Board' })).toBeVisible();

  await page.fill('#title', 'E2E Test Board');
  await page.fill('#category-0-name', 'Classic Novels');
  await page.fill('#question-0-0-question', 'This 1960 novel by Harper Lee features Scout Finch');
  await page.fill('#question-0-0-answer', 'What is To Kill a Mockingbird?');

  await page.getByRole('button', { name: 'Create Board' }).click();

  await expect(page).toHaveURL(/\/admin\/boards\/\d+\/edit/);
  await expect(page.getByRole('heading', { name: 'Edit Board' })).toBeVisible();
  await expect(page.locator('#title')).toHaveValue('E2E Test Board');
});

test('administrator can edit a board and the change persists', async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto('/admin/boards/new');
  await page.fill('#title', 'Original Title');
  await page.fill('#category-0-name', 'Category One');
  await page.getByRole('button', { name: 'Create Board' }).click();
  await expect(page).toHaveURL(/\/admin\/boards\/\d+\/edit/);

  await page.fill('#title', 'Updated Title');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page).toHaveURL(/\/admin\/boards\/\d+\/edit/);
  await expect(page.locator('#title')).toHaveValue('Updated Title');
});
