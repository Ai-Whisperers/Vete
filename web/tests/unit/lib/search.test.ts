import { describe, it, expect } from 'vitest'
import {
  createSearchPattern,
  escapeLikePattern,
  validateSearchQuery,
  MIN_SEARCH_LENGTH,
  MAX_SEARCH_LENGTH,
} from '@/lib/utils/search'

describe('Search Utilities', () => {
  describe('escapeLikePattern', () => {
    it('should escape percent signs', () => {
      expect(escapeLikePattern('100%')).toBe('100\\%')
    })

    it('should escape underscores', () => {
      expect(escapeLikePattern('test_value')).toBe('test\\_value')
    })

    it('should escape backslashes', () => {
      expect(escapeLikePattern('path\\name')).toBe('path\\\\name')
    })

    it('should not modify plain text', () => {
      expect(escapeLikePattern('fluffy')).toBe('fluffy')
    })
  })

  describe('createSearchPattern', () => {
    it('should wrap search term in LIKE pattern', () => {
      expect(createSearchPattern('fluffy')).toBe('%fluffy%')
    })

    it('should escape special characters', () => {
      expect(createSearchPattern('100%')).toBe('%100\\%%')
    })

    it('should return empty string for empty input', () => {
      expect(createSearchPattern('')).toBe('')
    })

    it('should trim whitespace', () => {
      expect(createSearchPattern('  fluffy  ')).toBe('%fluffy%')
    })

    it('should return empty for whitespace only', () => {
      expect(createSearchPattern('   ')).toBe('')
    })

    it('should handle combined special characters', () => {
      expect(createSearchPattern('50%_test')).toBe('%50\\%\\_test%')
    })
  })

  describe('validateSearchQuery', () => {
    it('should return null for null input', () => {
      expect(validateSearchQuery(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(validateSearchQuery(undefined)).toBeNull()
    })

    it('should return null for too short query', () => {
      expect(validateSearchQuery('a')).toBeNull()
    })

    it('should return null for too long query', () => {
      expect(validateSearchQuery('a'.repeat(101))).toBeNull()
    })

    it('should return trimmed query for valid input', () => {
      expect(validateSearchQuery('  test  ')).toBe('test')
    })

    it('should accept minimum length query', () => {
      expect(validateSearchQuery('ab')).toBe('ab')
    })

    it('should accept maximum length query', () => {
      expect(validateSearchQuery('a'.repeat(100))).toBe('a'.repeat(100))
    })
  })

  describe('constants', () => {
    it('MIN_SEARCH_LENGTH should be 2', () => {
      expect(MIN_SEARCH_LENGTH).toBe(2)
    })

    it('MAX_SEARCH_LENGTH should be 100', () => {
      expect(MAX_SEARCH_LENGTH).toBe(100)
    })
  })
})
