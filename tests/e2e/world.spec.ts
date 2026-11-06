import { test } from '@playwright/test';

for (const [name, query] of [['normal', ''], ['top', '?cam=top']] as const) {
  test(`world_screenshot_${name}`, async ({ page }, info) => {
    await page.goto('/' + query);
    await page.getByRole('button', { name: '문을 연다' }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: info.outputPath(`world-${name}.png`) });
  });
}
