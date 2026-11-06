import { expect, test } from '@playwright/test';

test('smoke_openingToPlaza_noConsoleErrors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  // walk the real opening: black -> phone -> letter -> monologue -> door
  await page.getByTestId('opening-black').click();
  await page.getByTestId('phone-notice').click();
  await expect(page.getByText('인천대학교 자유전공학부 27학번 입학을 축하합니다.')).toBeVisible();
  await page.getByTestId('admission-letter').click();
  await page.getByTestId('monologue').click();
  await page.getByTestId('monologue').click();
  await page.getByRole('button', { name: '문을 연다' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByTestId('hud')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: info.outputPath('before.png') });
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2000);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('after.png') });
  expect(errors).toEqual([]);
});

test('smoke_skipOpening_reachesExplore', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page.getByTestId('hud')).toBeVisible();
});
