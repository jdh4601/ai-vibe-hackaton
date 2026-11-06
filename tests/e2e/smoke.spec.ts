import { expect, test } from '@playwright/test';

test('smoke_openingToPlaza_noConsoleErrors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: '문을 연다' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: info.outputPath('before.png') });
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2000);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('after.png') });
  expect(errors).toEqual([]);
});
