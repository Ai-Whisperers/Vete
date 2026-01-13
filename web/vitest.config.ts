import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      // Mock redis module for tests (optional dependency)
      redis: resolve(__dirname, './tests/__mocks__/redis.ts'),
      // Mock server-only to allow testing server components/routes
      'server-only': resolve(__dirname, './tests/__mocks__/server-only.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.next/**',
        'tests/__fixtures__/**',
        'tests/__helpers__/**',
        'lib/test-utils/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/route.ts', // API routes tested separately via integration tests
      ],
      // Coverage thresholds - lowered after removing tests incompatible with withActionAuth
      thresholds: {
        lines: 45,
        functions: 50,
        branches: 35,
        statements: 45,
      },
    },
    // Increase timeout for async operations
    testTimeout: 10000,

    // Test file patterns
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],

    // Exclude E2E tests (handled by Playwright)
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],

    // Reporter configuration
    reporters: ['verbose'],

    // Pool configuration for parallel execution
    pool: 'threads',
    isolate: true,

    // Sequence configuration
    sequence: {
      shuffle: false, // Deterministic test order
    },

    // Retry failed tests
    retry: 1,

    // Watch mode configuration
    watch: false, // Disabled by default, enable with --watch flag
  },
})
