import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        // Use localStorage for persistence in the browser
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  )
}
