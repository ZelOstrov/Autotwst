import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['./reporter.ts']],
  timeout: 180000,
  use: {
    baseURL: 'https://www.tehnodrom.ru',
    trace: 'retain-on-failure',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
