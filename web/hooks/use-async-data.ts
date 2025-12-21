import { useState, useEffect, useCallback } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isRefetching: boolean;
}

export interface UseAsyncDataOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseAsyncDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isRefetching: boolean;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions = {}
): UseAsyncDataResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    retryCount = 0,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    isLoading: true,
    error: null,
    isRefetching: false
  });

  const execute = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    setState(prev => ({
      ...prev,
      isLoading: !isRefetch && prev.data === null,
      isRefetching: isRefetch,
      error: null
    }));

    let attempt = 0;
    const maxAttempts = retryCount + 1;

    while (attempt < maxAttempts) {
      try {
        const result = await asyncFunction();
        setState({
          data: result,
          isLoading: false,
          error: null,
          isRefetching: false
        });
        return;
      } catch (error) {
        attempt++;

        if (attempt === maxAttempts) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          setState({
            data: null,
            isLoading: false,
            error: errorMessage,
            isRefetching: false
          });
          return;
        }

        // Wait before retrying
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
  }, [asyncFunction, enabled, retryCount, retryDelay]);

  const refetch = useCallback(() => execute(true), [execute]);
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isRefetching: false
    });
  }, []);

  useEffect(() => {
    execute();
  }, deps);

  useEffect(() => {
    if (refetchOnWindowFocus) {
      const handleFocus = () => refetch();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetch, refetchOnWindowFocus]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    isRefetching: state.isRefetching,
    refetch,
    reset
  };
}
