import { defineConfig } from '@playwright/test'

/**
 * Simple Playwright Config for Quick Tests
 * 
 * Run: npx playwright test --config=playwright.simple.config.ts
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*-simple.spec.ts',
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
