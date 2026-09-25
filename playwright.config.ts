import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/browser-report', open: 'never' }]],
  outputDir: 'artifacts/browser-results',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' } },
  ],
  webServer: [
    {
      command: 'npm run preview -- --port 4321 --ignore-lock',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'node ../../node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322 --ignore-lock',
      cwd: '.local/content-fixtures',
      url: 'http://127.0.0.1:4322',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
