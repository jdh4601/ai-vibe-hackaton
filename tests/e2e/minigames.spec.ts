import { expect, test } from '@playwright/test';
import { solveOrdering } from './helpers';

const KINDS = ['dial', 'trace', 'fillBlank', 'ordering-word', 'ordering-code'] as const;

for (const kind of KINDS) {
  test(`preview_${kind}_rendersWithoutErrors`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto(`/?minigame=${kind}`);
    await expect(page.getByTestId('minigame-modal')).toBeVisible();
    await page.screenshot({ path: info.outputPath(`${kind}.png`) });
    expect(errors).toEqual([]);
  });
}



test('orderingWord_keyboardSolve_showsSuccess', async ({ page }, info) => {
  await page.goto('/?minigame=ordering-word');
  await solveOrdering(page, ['wo', 'shi', 'xuesheng']);
  await page.screenshot({ path: info.outputPath('ordering-word-solved.png') });
  await page.getByRole('button', { name: '제출' }).click();
  await expect(page.getByTestId('od-prompt')).toContainText('인천대학교', { timeout: 3000 });
  await solveOrdering(page, ['wo', 'shi', 'inu', 'de', 'xuesheng']);
  await page.getByRole('button', { name: '제출' }).click();
  await expect(page.getByTestId('success-banner')).toBeVisible({ timeout: 3000 });
});

test('orderingCode_wrongTwice_showsHint', async ({ page }, info) => {
  await page.goto('/?minigame=ordering-code');
  // the shuffle never equals the answer, so submitting right away is always a miss
  await page.getByRole('button', { name: '제출' }).click();
  await page.getByRole('button', { name: '제출' }).click();
  await expect(page.getByTestId('fail-count')).toContainText('2회');
  await expect(page.getByTestId('hint')).toBeVisible();
  await page.screenshot({ path: info.outputPath('ordering-code-hint.png') });
});

test('fillBlank_mouseDragTiles_showsSuccess', async ({ page }, info) => {
  await page.goto('/?minigame=fillBlank');
  const answers = [15, 18, 3];
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId('fb-round')).toContainText(`라운드 ${i + 1}`);
    const tile = page.getByTestId(`tile-${answers[i]}`);
    const blank = page.getByTestId('blank');
    const t = (await tile.boundingBox())!;
    const b = (await blank.boundingBox())!;
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
    await page.mouse.down();
    await page.mouse.move(t.x + t.width / 2 + 20, t.y + t.height / 2 - 20, { steps: 4 });
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
    if (i === 0) await page.screenshot({ path: info.outputPath('fillblank-dragging.png') });
    await page.mouse.up();
  }
  await expect(page.getByTestId('success-banner')).toBeVisible({ timeout: 3000 });
});

test('dial_dragKnob_changesReadout', async ({ page }, info) => {
  await page.goto('/?minigame=dial');
  const knob = page.getByTestId('dial-knob');
  const box = (await knob.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  // start at the bottom-left (zero) and sweep clockwise over the top
  const at = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return [cx + 70 * Math.sin(r), cy - 70 * Math.cos(r)] as const;
  };
  await page.mouse.move(...at(-135));
  await page.mouse.down();
  for (let deg = -125; deg <= 0; deg += 8) await page.mouse.move(...at(deg));
  await page.mouse.up();
  const value = await page.getByTestId('readout').getAttribute('data-value');
  expect(Number(value)).toBeGreaterThan(0);
  await page.screenshot({ path: info.outputPath('dial-dragged.png') });
});

test('trace_drawAndSubmit_showsScore', async ({ page }, info) => {
  await page.goto('/?minigame=trace');
  const canvas = page.getByTestId('trace-canvas');
  const box = (await canvas.boundingBox())!;
  const sx = box.width / 640;
  const sy = box.height / 420;
  const pts: [number, number][] = [[200, 110], [400, 110], [370, 330], [230, 330], [200, 110]];
  await page.mouse.move(box.x + pts[0][0] * sx, box.y + pts[0][1] * sy);
  await page.mouse.down();
  for (const [x, y] of pts.slice(1)) await page.mouse.move(box.x + x * sx, box.y + y * sy, { steps: 25 });
  await page.mouse.up();
  await page.getByRole('button', { name: '제출' }).click();
  await expect(page.getByTestId('trace-score')).toContainText('일치율');
  await page.screenshot({ path: info.outputPath('trace-submitted.png') });
});
