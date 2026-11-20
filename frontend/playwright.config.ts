import { defineConfig, devices } from '@playwright/test'

// Mobile-first end-to-end tests. The phone profile sets the viewport,
// touch support and device scale factor. Set PLAYWRIGHT_CHROMIUM_PATH to
// use a pre-installed Chromium binary instead of Playwright's bundled one.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        launchOptions: chromiumPath ? { executablePath: chromiumPath, args: ['--no-sandbox'] } : {},
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
