import { expect, test } from '@playwright/test';
import { enterPlaza } from './helpers';
import type { Page } from '@playwright/test';

async function boot(page: Page) {
  await page.goto('/?debug=1&seed=1');
  await enterPlaza(page);
  await page.waitForFunction(() => window.__game !== undefined);
  await page.evaluate(() => window.__game!.skipOpening());
}

const phase = (page: Page) => page.evaluate(() => window.__game!.getState().phase);

test('systems_questFlow_dialogueMinigameSkill', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await boot(page);
  expect(await phase(page)).toBe('explore');

  await page.evaluate(() => window.__game!.teleportToNextQuest());

  await page.evaluate(async () => {
    const { useDialogueStore } = await import('/src/stores/useDialogueStore.ts');
    useDialogueStore.getState().start('npc-ee');
  });
  expect(await phase(page)).toBe('dialogue');
  expect(await page.evaluate(() => window.__game!.getState().quests['q1-ee'].status)).toBe('offered');

  await page.evaluate(async () => {
    const { useDialogueStore } = await import('/src/stores/useDialogueStore.ts');
    useDialogueStore.getState().choose('accept');
  });
  expect(await phase(page)).toBe('minigame');

  await page.evaluate(() => window.__game!.solveMinigame());
  expect(await phase(page)).toBe('dialogue');

  await page.evaluate(async () => {
    const { useDialogueStore } = await import('/src/stores/useDialogueStore.ts');
    for (let i = 0; i < 5 && useDialogueStore.getState().script; i++) useDialogueStore.getState().advance();
  });
  const state = await page.evaluate(() => window.__game!.getState());
  expect(state.skills).toContain('skill-ee');
  expect(state.phase).toBe('skillAcquired');
  expect(state.quests['q1-ee'].status).toBe('cleared');
  expect(errors).toEqual([]);
});

test('systems_events_threeEventsNotify', async ({ page }) => {
  await boot(page);
  const read = () =>
    page.evaluate(async () => {
      const { useNotificationStore } = await import('/src/stores/useNotificationStore.ts');
      return useNotificationStore.getState().items.map((n) => n.text);
    });

  await page.evaluate(() => window.__game!.triggerEvent('professorKidnap'));
  expect(await page.evaluate(() => window.__game!.getState().activeEvent)).toBe('professorKidnap');
  expect(await read()).toContain('교수님이 다가옵니다! 도망치세요!');

  await page.evaluate(() => window.__game!.triggerEvent('assignmentAlert'));
  expect((await read()).some((t) => t.startsWith('오늘 마감: '))).toBe(true);

  await page.evaluate(() => window.__game!.triggerEvent('snackEvent'));
  expect(await page.evaluate(() => window.__game!.getState().activeEvent)).toBe('snackEvent');
  expect(await read()).toContain('학생회 간식 나눔 행사 중! (60초)');
});

test('systems_grantAllSkills_unlocksEnding', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => window.__game!.grantAllSkills());
  const s = await page.evaluate(() => window.__game!.getState());
  expect(s.endingUnlocked).toBe(true);
  expect(s.skills).toHaveLength(5);
});
