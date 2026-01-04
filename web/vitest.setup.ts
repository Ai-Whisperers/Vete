import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Supabase client globally if needed
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
