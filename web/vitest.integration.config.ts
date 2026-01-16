import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'node', // Node environment for real database operations
    
    // NO setup files - avoid global mocks
    setupFiles: [],
    
    // Longer timeout for database operations
    testTimeout: 30000,
    
    // Test file patterns
    include: ['tests/integration/**/*.test.ts', 'tests/integration/**/*.test.tsx'],
    
    // Exclude other test types
    exclude: ['node_modules/**', 'tests/unit/**', 'tests/api/**', 'tests/e2e/**'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/**',
        'tests/__fixtures__/**',
        'tests/__helpers__/**',
        'tests/__mocks__/**',
      ],
    },
    
    // Reporter
    reporters: ['verbose'],
    
    // Pool configuration - use forks to completely isolate from mocks
    pool: 'forks',
    isolate: true,
    
    // No retry for integration tests (they should be deterministic)
    retry: 0,
  },
})
