import { describe, it, expect } from 'vitest'
import type { PrivacyPolicyStatus, PrivacyLanguage, PrivacyPolicy, ConsentRecord } from '@/lib/privacy/types'

describe('Privacy Types', () => {
  describe('PrivacyPolicyStatus', () => {
    it('should accept draft status', () => {
      const status: PrivacyPolicyStatus = 'draft'
      expect(status).toBe('draft')
    })

    it('should accept published status', () => {
      const status: PrivacyPolicyStatus = 'published'
      expect(status).toBe('published')
    })

    it('should accept archived status', () => {
      const status: PrivacyPolicyStatus = 'archived'
      expect(status).toBe('archived')
    })
  })

  describe('PrivacyLanguage', () => {
    it('should accept Spanish', () => {
      const lang: PrivacyLanguage = 'es'
      expect(lang).toBe('es')
    })

    it('should accept English', () => {
      const lang: PrivacyLanguage = 'en'
      expect(lang).toBe('en')
    })
  })

  describe('PrivacyPolicy', () => {
    it('should create a valid privacy policy', () => {
      const policy: PrivacyPolicy = {
        id: 'policy-1',
        tenantId: 'clinic-1',
        version: '1.0.0',
        status: 'published',
        effectiveDate: '2024-01-01',
        contentEs: 'Contenido en español',
        changeSummary: ['Initial version'],
        requiresReacceptance: false,
      }

      expect(policy.id).toBe('policy-1')
      expect(policy.status).toBe('published')
      expect(policy.contentEs).toBeDefined()
    })

    it('should allow optional English content', () => {
      const policy: PrivacyPolicy = {
        id: 'policy-1',
        tenantId: 'clinic-1',
        version: '1.0.0',
        status: 'published',
        effectiveDate: '2024-01-01',
        contentEs: 'Contenido en español',
        contentEn: 'English content',
        changeSummary: ['Added English'],
        requiresReacceptance: false,
      }

      expect(policy.contentEn).toBe('English content')
    })

    it('should allow optional expiresAt', () => {
      const policy: PrivacyPolicy = {
        id: 'policy-1',
        tenantId: 'clinic-1',
        version: '1.0.0',
        status: 'published',
        effectiveDate: '2024-01-01',
        expiresAt: '2025-01-01',
        contentEs: 'Contenido',
        changeSummary: [],
        requiresReacceptance: false,
      }

      expect(policy.expiresAt).toBe('2025-01-01')
    })

    it('should allow previousVersionId reference', () => {
      const policy: PrivacyPolicy = {
        id: 'policy-2',
        tenantId: 'clinic-1',
        version: '1.1.0',
        status: 'published',
        effectiveDate: '2024-06-01',
        contentEs: 'Nuevo contenido',
        changeSummary: ['Updated privacy terms'],
        requiresReacceptance: true,
        previousVersionId: 'policy-1',
      }

      expect(policy.previousVersionId).toBe('policy-1')
    })
  })

  describe('ConsentRecord', () => {
    it('should create a consent record', () => {
      const consent: ConsentRecord = {
        id: 'consent-1',
        userId: 'user-123',
        tenantId: 'clinic-1',
        policyId: 'policy-1',
        policyVersion: '1.0.0',
        granted: true,
        grantedAt: new Date().toISOString(),
      }

      expect(consent.id).toBeDefined()
      expect(consent.granted).toBe(true)
    })

    it('should allow revoked consent', () => {
      const consent: ConsentRecord = {
        id: 'consent-1',
        userId: 'user-123',
        tenantId: 'clinic-1',
        policyId: 'policy-1',
        policyVersion: '1.0.0',
        granted: false,
        grantedAt: new Date().toISOString(),
        revokedAt: new Date().toISOString(),
        reason: 'User requested removal',
      }

      expect(consent.granted).toBe(false)
      expect(consent.revokedAt).toBeDefined()
    })
  })
})
