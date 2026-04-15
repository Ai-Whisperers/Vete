import { SWRConfig } from 'swr'

/**
 * SWR configuration with caching and retry logic
 */
export const swrConfig: SWRConfig = {
  // Enable caching for GET requests
  fetcher: async (url: string) => {
    const response = await fetch(url)
    return response.json()
  },
  // Retry failed requests up to 3 times
  retry: 3,
  // Deduping interval: 10 seconds
  dedupingInterval: 10000,
}

/**
 * Create SWR hook with caching and retry logic
 */
export function useSwrWithCache<T>(url: string) {
  return useSwr<T>(url, swrConfig)
}