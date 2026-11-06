import { expect, test } from '@playwright/test';
import { acceptNextQuest, enterPlaza, finishQuest, solveOrdering } from './helpers';

// Q1–Q5 in order: each NPC opens the right minigame; Q4 is solved through the real UI (plan 4.5).
const QUESTS = [
  { id: 'q1-ee', game: 'dial-knob', emoji: '📡' },
  { id: 'q2-design', game: 'trace-canvas', emoji: '🎨' },
  { id: 'q3-math', game: 'blank', emoji: '📐' },
  { id: 'q4-neat', game: 'od-list', emoji: '🪶' },
  { id: 'q5-cse', game: 'od-list', emoji: '🐧' },
] as const;

test('quests_allFiveInOrder_unlockEnding', async ({ page }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?debug=1&seed=1');
  await enterPlaza(page);

  for (const [i, q] of QUESTS.entries()) {
    await acceptNextQuest(page);
    await expect(page.getByTestId(q.game)).toBeVisible();
    expect(await page.evaluate(() => window.__game!.getState())).toMatchObject({ phase: 'minigame' });

    if (q.id === 'q4-neat') {
      await expect(page.getByTestId('od-prompt')).toContainText('학생');
      await solveOrdering(page, ['wo', 'shi', 'xuesheng'], 4);
      await page.getByRole('button', { name: '제출' }).click();
      await expect(page.getByTestId('od-prompt')).toContainText('인천대학교', { timeout: 5000 });
      await solveOrdering(page, ['wo', 'shi', 'inu', 'de', 'xuesheng'], 4);
      await page.getByRole('button', { name: '제출' }).click();
    } else {
      await page.evaluate(() => window.__game!.solveMinigame());
    }

    await finishQuest(page);
    await expect(page.getByTestId('skill-list')).toContainText(q.emoji);
    await expect(page.getByTestId('quest-tracker')).toContainText(`${i + 1}/5`);
    expect(await page.evaluate((id) => window.__game!.getState().quests[id].status, q.id)).toBe('cleared');
  }

  expect(await page.evaluate(() => window.__game!.getState().endingUnlocked)).toBe(true);
  await expect(page.getByTestId('notification-stack')).toContainText('분수대');
  expect(errors).toEqual([]);
});
