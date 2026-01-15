import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      redis: resolve(__dirname, './tests/__mocks__/redis.ts'),
      'server-only': resolve(__dirname, './tests/__mocks__/server-only.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node', // Integration tests often run better in node env for DB access, though jsdom is fine too. Let's stick to node or jsdom? Original was jsdom. DB client works in both.
    // Use the specific setup file that DOES NOT mock Supabase
    setupFiles: ['./vitest.integration.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage-integration',
      exclude: [
        'node_modules/**',
        '.next/**',
        'tests/__fixtures__/**',
        'tests/__helpers__/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    testTimeout: 30000, // Longer timeout for integration tests
    include: ['tests/integration/**/*.test.ts', 'tests/integration/**/*.test.tsx'],
    // Exclude E2E tests
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],
    reporters: ['verbose'],
    pool: 'forks', // Forks might be better for DB isolation than threads
    isolate: true,
    sequence: {
      shuffle: false,
    },
    retry: 0, // Don't retry integration tests blindly
    watch: false,
  },
})
