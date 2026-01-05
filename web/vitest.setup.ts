import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// =============================================================================
// QA Infrastructure Integration
// =============================================================================

import { resetIdCounter } from '@/lib/test-utils/factories'
import { resetMockState } from '@/lib/test-utils/mock-presets'

/**
 * Global beforeEach hook
 * - Resets mock state (auth scenarios, table results)
 * - Resets ID counter for predictable test IDs
 */
beforeEach(() => {
  resetMockState()
  resetIdCounter()
})

/**
 * Global afterEach hook
 * - Clears all mocks
 */
afterEach(() => {
  vi.clearAllMocks()
})

// =============================================================================
// Default Supabase Mock (for tests that don't use mockState)
// =============================================================================

// Mock Supabase client globally as fallback
vi.mock('@supabase/supabase-js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@supabase/supabase-js')>()
  return {
    ...actual,
    createClient: () => ({
      from: () => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockResolvedValue({ data: [], error: null }),
        delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    }),
  }
})
