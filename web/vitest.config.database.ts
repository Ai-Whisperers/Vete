import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'database',
    environment: 'node',
    include: ['tests/database/**/*.test.ts'],
    globals: true,
    setupFiles: ['./tests/database/setup-vitest.ts'],
    testTimeout: 30000, // 30s for database operations
    hookTimeout: 30000,
    teardownTimeout: 30000,
    pool: 'threads',
    // Note: poolOptions removed in Vitest 4
    // Database tests run sequentially via beforeAll/afterAll hooks
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
