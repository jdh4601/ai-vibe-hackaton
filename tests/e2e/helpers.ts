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
