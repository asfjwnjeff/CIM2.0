import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://localhost:5000',
    channel: 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
  },
  retries: 0,
  reporter: [['html'], ['list']],
});
