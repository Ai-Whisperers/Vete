import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/lib/utils/sanitize'

describe('Sanitize Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should strip script tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should allow safe HTML tags', () => {
      const result = sanitizeHtml('<p>Hello <strong>World</strong></p>')
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('should strip onclick attributes', () => {
      const result = sanitizeHtml('<div onclick="alert(1)">Click</div>')
      expect(result).not.toContain('onclick')
    })

    it('should allow links with href', () => {
      const result = sanitizeHtml('<a href="https://example.com">Link</a>')
      expect(result).toContain('href')
      expect(result).toContain('Link')
    })
  })
})
