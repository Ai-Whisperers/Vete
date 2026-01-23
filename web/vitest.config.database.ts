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
    poolOptions: {
      threads: {
        singleThread: true, // Run database tests sequentially to avoid race conditions
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
