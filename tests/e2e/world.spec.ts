import { test } from '@playwright/test';

const shots: [string, string][] = [
  ['normal', ''],
  ['normal2', ''], ['normal3', ''],
  ['top', '?cam=top'],
  ['fountain', '?cam=fountain'],
];

for (const [name, query] of shots) {
  test(`world_screenshot_${name}`, async ({ page }, info) => {
    await page.goto('/' + query);
    await page.getByRole('button', { name: '문을 연다' }).click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: info.outputPath(`world-${name}.png`) });
  });
}
