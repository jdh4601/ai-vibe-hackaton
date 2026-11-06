import { expect, test, type Page } from '@playwright/test';
import { enterPlaza } from './helpers';

const phase = (page: Page) => page.evaluate(() => window.__game!.getState().phase);

// Click through dialogue lines until the choice buttons (or the end of the script) appear.
async function clickThroughDialogue(page: Page, until: () => Promise<boolean>) {
  const box = page.getByTestId('dialogue-box');
  for (let i = 0; i < 30 && !(await until()); i++) {
    if (await box.isVisible()) await page.keyboard.press('Space');
    await page.waitForTimeout(250);
  }
}

test('q1_talkAcceptSolve_grantsLidarSkill', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?debug=1&seed=1');
  await enterPlaza(page);
  await expect(page.getByTestId('quest-tracker')).toContainText('0/5');

  // walk up to the EE senior and press E
  await page.evaluate(() => window.__game!.teleportToNextQuest());
  await page.waitForTimeout(800);
  await page.keyboard.press('KeyE');
  await expect(page.getByTestId('dialogue-box')).toBeVisible();
  expect(await phase(page)).toBe('dialogue');

  const accept = page.getByRole('button', { name: '도와준다' });
  await clickThroughDialogue(page, () => accept.isVisible());
  await accept.click();

  // DialGame opens in the minigame modal; the debug hook stands in for turning the dial
  await expect(page.getByTestId('minigame-modal')).toBeVisible();
  await expect(page.getByTestId('dial-knob')).toBeVisible();
  await page.evaluate(() => window.__game!.solveMinigame());

  // success lines → skill acquired overlay
  const acquired = page.getByTestId('skill-acquired');
  await clickThroughDialogue(page, () => acquired.isVisible());
  await expect(acquired).toContainText('라이다 센서');
  // the overlay also auto-closes after ~3s (FR-5.1), so the click is optional
  await acquired.click({ timeout: 2000 }).catch(() => {});

  await expect.poll(() => phase(page)).toBe('explore');
  await expect(page.getByTestId('skill-list')).toContainText('📡');
  await expect(page.getByTestId('quest-tracker')).toContainText('1/5');
  expect(errors).toEqual([]);
});

test('decline_talkThenLater_staysOfferedAndExplore', async ({ page }) => {
  await page.goto('/?debug=1&seed=1');
  await enterPlaza(page);
  await page.evaluate(() => window.__game!.teleportToNextQuest());
  await page.waitForTimeout(800);
  await page.keyboard.press('KeyE');
  const later = page.getByRole('button', { name: '다음에' });
  await clickThroughDialogue(page, () => later.isVisible());
  await later.click();
  await clickThroughDialogue(page, async () => (await phase(page)) === 'explore');
  await expect(page.getByTestId('minigame-modal')).toHaveCount(0);
  expect(await page.evaluate(() => window.__game!.getState().quests['q1-ee'].status)).toBe('offered');
});
