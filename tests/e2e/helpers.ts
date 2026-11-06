import { expect, type Page } from '@playwright/test';

// Skip the opening sequence and wait until the plaza HUD is up and the 3D frame loop is running.
// Needs ?debug=1 (window.__game). Headless Chromium renders on a software GPU, so the first
// frames can take ~10s. Use window.__game rather than import('/src/...'): after HMR the app's
// modules carry a ?t= suffix and a bare import would get a separate store instance.
export async function enterPlaza(page: Page): Promise<void> {
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page.getByTestId('hud')).toBeVisible();
  // a teleport is only consumed by Player inside useFrame, so its completion proves frames are ticking
  await page.evaluate(() => window.__game!.teleportTo([0, 1, 47]));
  await expect
    .poll(() => page.evaluate(() => Math.abs(window.__game!.getState().player.position[2] - 47) < 0.5), {
      timeout: 45_000,
    })
    .toBe(true);
}

export const phaseOf = (page: Page) => page.evaluate(() => window.__game!.getState().phase);

// Press Space through dialogue lines until `until` holds (choice buttons, overlay, phase...).
export async function advanceDialogue(page: Page, until: () => Promise<boolean>, maxPresses = 40): Promise<void> {
  const box = page.getByTestId('dialogue-box');
  for (let i = 0; i < maxPresses && !(await until()); i++) {
    if (await box.isVisible()) await page.keyboard.press('Space');
    await page.waitForTimeout(250);
  }
}

// From explore: walk up to the next uncleared quest NPC, talk, and accept the task.
export async function acceptNextQuest(page: Page): Promise<void> {
  await page.evaluate(() => window.__game!.teleportToNextQuest());
  await page.waitForTimeout(800);
  await page.keyboard.press('KeyE');
  await expect(page.getByTestId('dialogue-box')).toBeVisible();
  const accept = page.getByRole('button', { name: '도와준다' });
  await advanceDialogue(page, () => accept.isVisible());
  await accept.click();
  await expect(page.getByTestId('minigame-modal')).toBeVisible();
}

// After a minigame is cleared: success lines → skill overlay → back to explore.
export async function finishQuest(page: Page): Promise<void> {
  const acquired = page.getByTestId('skill-acquired');
  await advanceDialogue(page, () => acquired.isVisible());
  // the overlay also auto-closes after ~3s (FR-5.1), so the click is optional
  await acquired.click({ timeout: 2000 }).catch(() => {});
  await expect.poll(() => phaseOf(page), { timeout: 10_000 }).toBe('explore');
}

export async function chipIds(page: Page): Promise<string[]> {
  return page.locator('[data-testid="chip"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.id ?? ''));
}

// dnd-kit's keyboard sensor needs short pauses between Space and arrow presses.
// `pace` stretches them; in the full game the headless software renderer slows the main thread.
export async function solveOrdering(page: Page, answer: string[], pace = 1): Promise<void> {
  for (let target = 0; target < answer.length; target++) {
    const from = (await chipIds(page)).indexOf(answer[target]!);
    if (from === target) continue;
    await page.waitForTimeout(300 * pace);
    await page.locator('[data-testid="chip"]').nth(from).focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(250 * pace);
    for (let k = 0; k < from - target; k++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200 * pace);
    }
    await page.keyboard.press('Space');
    await expect.poll(async () => (await chipIds(page))[target]).toBe(answer[target]);
  }
}
