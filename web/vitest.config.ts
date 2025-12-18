import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.next/**',
        'tests/__fixtures__/**',
        'tests/__helpers__/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    alias: {
      '@': resolve(__dirname, './'),
    },
    // Increase timeout for async operations
    testTimeout: 10000,

    // Test file patterns
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],

    // Exclude E2E tests (handled by Playwright)
    exclude: [
      'node_modules/**',
      'e2e/**',
      '.next/**',
    ],

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
    watch: true,
    watchExclude: ['node_modules/**', '.next/**'],
  },
});
