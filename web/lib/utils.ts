import { createClient } from '@supabase/supabase-js'

/**
 * Log query execution time
 */
export function logQuery(query: string, executionTime: number): void {
  console.log(`Query executed in ${executionTime}ms: ${query}`)
}

/**
 * Create a Supabase client with logging
 */
export function createClientWithLogging(): SupabaseClient {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      hooks: {
        query: {
          handled: (query, { executionTime }) => {
            logQuery(query, executionTime)
          },
        },
      },
    }
  )

  return supabase
}