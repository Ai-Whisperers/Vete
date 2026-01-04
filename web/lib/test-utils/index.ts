// Legacy simple factories (backward compatible)
export * from './factories'
export * from './supabase-mock'

// New builder-pattern factories
export * from './factories/index'

// Test context for mode and cleanup (exclude Mode since factories/types exports it)
export { testContext, setMode, getMode, isTestMode, isSeedMode } from './context'

// API client for seeding
export * from './api-client'

// Re-export testing library utilities
export { render, screen, fireEvent, waitFor } from '@testing-library/react'
export { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
