import { vi } from 'vitest'

type MockResponse<T> = { data: T | null; error: Error | null }

export function createSupabaseMock<T = unknown>() {
  // Chain methods - create chainable mock
  const createChainMock = () => {
    const chain: any = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      gt: vi.fn(),
      gte: vi.fn(),
      lt: vi.fn(),
      lte: vi.fn(),
      like: vi.fn(),
      ilike: vi.fn(),
      is: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    // Make all methods return the chain for chaining
    Object.keys(chain).forEach(key => {
      if (key !== 'single' && key !== 'maybeSingle') {
        chain[key].mockReturnValue(chain)
      }
    })

    // Also make select return a promise with data/error for direct use
    chain.select.mockImplementation(() => {
      const result = Object.assign(
        Promise.resolve({ data: null, error: null }),
        chain
      )
      return result
    })

    return chain
  }

  const chainMock = createChainMock()
  const fromMock = vi.fn().mockReturnValue(chainMock)

  const supabaseMock = {
    from: fromMock,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  // Helper functions
  const setQueryResult = (data: T | T[], error: Error | null = null) => {
    const singleData = Array.isArray(data) ? data[0] : data
    const arrayData = Array.isArray(data) ? data : [data]

    chainMock.single.mockResolvedValue({ data: singleData, error })
    chainMock.maybeSingle.mockResolvedValue({ data: singleData, error })

    // Update select to return promise with correct data
    chainMock.select.mockImplementation(() => {
      const result = Object.assign(
        Promise.resolve({ data: arrayData, error }),
        chainMock
      )
      return result
    })
  }

  const setUser = (user: { id: string; email: string } | null) => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    })
  }

  const setError = (error: Error) => {
    chainMock.single.mockResolvedValue({ data: null, error })
    chainMock.maybeSingle.mockResolvedValue({ data: null, error })

    // Update select to return promise with error
    chainMock.select.mockImplementation(() => {
      const result = Object.assign(
        Promise.resolve({ data: null, error }),
        chainMock
      )
      return result
    })
  }

  return {
    supabase: supabaseMock,
    mocks: {
      from: fromMock,
      chain: chainMock,
    },
    helpers: {
      setQueryResult,
      setUser,
      setError,
      reset: () => {
        vi.clearAllMocks()
      },
    },
  }
}

// Type for the mock
export type SupabaseMock = ReturnType<typeof createSupabaseMock>
