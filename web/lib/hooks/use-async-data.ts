'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Status of an async data operation
 */
export type AsyncDataStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Result of the useAsyncData hook
 */
export interface AsyncDataResult<T> {
  /** The fetched data, undefined until successfully loaded */
  data: T | undefined
  /** Current loading status */
  status: AsyncDataStatus
  /** Whether data is currently being fetched */
  isLoading: boolean
  /** Whether data was successfully fetched */
  isSuccess: boolean
  /** Whether an error occurred */
  isError: boolean
  /** Error object if fetch failed */
  error: Error | undefined
  /** Re-fetch the data manually */
  refetch: () => Promise<void>
  /** Reset to initial state */
  reset: () => void
}

/**
 * Options for useAsyncData hook
 */
export interface UseAsyncDataOptions {
  /** Whether to fetch immediately on mount (default: true) */
  enabled?: boolean
  /** Called when fetch succeeds */
  onSuccess?: (data: unknown) => void
  /** Called when fetch fails */
  onError?: (error: Error) => void
  /** Refetch interval in milliseconds (disabled by default) */
  refetchInterval?: number
  /** Keep previous data while refetching (default: false) */
  keepPreviousData?: boolean
}

/**
 * Hook for managing async data fetching with loading, error, and refetch states.
 * Replaces the common useEffect + useState pattern for data fetching.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isLoading, error, refetch } = useAsyncData(
 *   () => fetch('/api/pets').then(r => r.json()),
 *   [tenantId] // re-fetch when tenantId changes
 * )
 *
 * // With options
 * const { data, isLoading } = useAsyncData(
 *   () => fetchPetDetails(petId),
 *   [petId],
 *   {
 *     enabled: !!petId,
 *     onSuccess: (pet) => console.log('Loaded:', pet),
 *     refetchInterval: 30000, // refresh every 30 seconds
 *   }
 * )
 *
 * // Conditional loading
 * if (isLoading) return <Spinner />
 * if (error) return <ErrorMessage error={error} />
 * if (!data) return null
 * return <PetList pets={data} />
 * ```
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions = {}
): AsyncDataResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
    keepPreviousData = false,
  } = options

  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<AsyncDataStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true)
  // Track current fetch to handle race conditions
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return

    const currentFetchId = ++fetchIdRef.current

    if (!keepPreviousData) {
      setStatus('loading')
    }
    setError(undefined)

    try {
      const result = await fetcher()

      // Only update if this is still the latest fetch and component is mounted
      if (isMountedRef.current && currentFetchId === fetchIdRef.current) {
        setData(result)
        setStatus('success')
        onSuccess?.(result)
      }
    } catch (err) {
      // Only update if this is still the latest fetch and component is mounted
      if (isMountedRef.current && currentFetchId === fetchIdRef.current) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setStatus('error')
        onError?.(error)
      }
    }
  }, [fetcher, keepPreviousData, onSuccess, onError])

  const reset = useCallback(() => {
    setData(undefined)
    setStatus('idle')
    setError(undefined)
  }, [])

  // Initial fetch and re-fetch on dependency changes
  useEffect(() => {
    isMountedRef.current = true

    if (enabled) {
      fetchData()
    }

    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchData()
      }
    }, refetchInterval)

    return () => clearInterval(intervalId)
  }, [refetchInterval, enabled, fetchData])

  return {
    data,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    refetch: fetchData,
    reset,
  }
}

/**
 * Simpler version for when you just need data and loading state.
 * Returns [data, isLoading, error] tuple.
 */
export function useSimpleAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): [T | undefined, boolean, Error | undefined] {
  const { data, isLoading, error } = useAsyncData(fetcher, deps)
  return [data, isLoading, error]
}
