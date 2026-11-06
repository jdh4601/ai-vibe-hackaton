import { defineConfig, devices } from '@playwright/test'

// PORT lets parallel worktrees run their own dev server (e.g. PORT=5181 npx playwright test).
const port = Number(process.env.PORT ?? 5173)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${port}`, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.PORT,
  },
})
