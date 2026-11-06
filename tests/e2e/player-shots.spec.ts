import { expect, test } from '@playwright/test';

const OUT = 'C:/Users/YM/Desktop/myPJ/coding-contest/.shots/phase1';

test('player_views_screenshots', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?debug=1&mockNpcs=1');
  await page.getByRole('button', { name: '문을 연다' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/B-hero-back.png` });
  await page.evaluate(async () => {
    const rig = await import('/src/world/playerLive.ts');
    rig.cameraRig.yaw += Math.PI;
    rig.cameraRig.pitch = 0.1;
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/B-hero-front.png` });
  await page.evaluate(async () => {
    const rig = await import('/src/world/playerLive.ts');
    rig.cameraRig.yaw -= Math.PI;
    const s = await import('/src/stores/usePlayerStore.ts');
    s.usePlayerStore.getState().requestTeleport([16, 1, -14]);
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/B-npc-bubble.png` });
  expect(errors).toEqual([]);
});

test('professor_chase_screenshot', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?debug=1');
  await page.getByRole('button', { name: '문을 연다' }).click();
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    const e = await import('/src/stores/useEventStore.ts');
    const p = await import('/src/stores/usePlayerStore.ts');
    const rig = await import('/src/world/playerLive.ts');
    const [px, , pz] = p.usePlayerStore.getState().position;
    const x = -Math.sin(rig.cameraRig.yaw) * 10;
    const z = -Math.cos(rig.cameraRig.yaw) * 10;
    const now = performance.now();
    e.useEventStore.setState({
      active: { id: 'professorKidnap', startedAt: now, endsAt: now + 30000, position: [px + x, 0, pz + z] },
    });
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'C:/Users/YM/Desktop/myPJ/coding-contest/.shots/phase1/B-professor.png' });
});
