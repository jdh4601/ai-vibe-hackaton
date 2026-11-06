import { test } from '@playwright/test';
import { enterPlaza } from './helpers';

const shots: [string, string][] = [
  ['normal', '?debug=1'],
  ['top', '?debug=1&cam=top'],
  ['fountain', '?debug=1&cam=fountain'],
];

for (const [name, query] of shots) {
  test(`world_screenshot_${name}`, async ({ page }, info) => {
    await page.goto('/' + query);
    await enterPlaza(page);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: info.outputPath(`world-${name}.png`) });
  });
}
