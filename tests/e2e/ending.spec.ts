import { expect, test } from '@playwright/test';
import { enterPlaza, phaseOf } from './helpers';

test('ending_pickCse_jacketCeremonyToCredits', async ({ page }) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?debug=1&seed=1');
  await enterPlaza(page);
  await page.evaluate(() => window.__game!.grantAllSkills());

  // walk onto the ★ at the central fountain
  await page.evaluate(() => window.__game!.teleportTo([0, 1, 2]));
  await expect.poll(() => phaseOf(page), { timeout: 20_000 }).not.toBe('explore');
  await expect(page.getByTestId('ending-select')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.es-card')).toHaveCount(5);

  await page.locator('.es-card', { hasText: '컴퓨터공학부' }).click();
  await expect(page.getByText('컴퓨터공학부로 정할래?')).toBeVisible();
  await page.getByRole('button', { name: '결정!' }).click();

  await expect(page.getByTestId('jacket-ceremony')).toBeVisible();
  await expect(page.getByText('나의 학과를 찾았다.')).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => window.__game!.getState().player.jacket.departmentLine)).toBe('컴퓨터공학부');
  await page.screenshot({ path: '.shots/phase3/ending-ceremony.png' });

  await expect(page.getByTestId('credits')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('credits')).toContainText('Made with Claude Code');
  await expect(page.getByRole('button', { name: '처음부터' })).toBeVisible();
  expect(errors).toEqual([]);
});
