import { describe, it, expect } from 'vitest'
import type { ConsentCategory, ConsentStatus, ConsentTemplate, ConsentDocument } from '@/lib/consent/types'

describe('Consent Types', () => {
  describe('ConsentCategory', () => {
    it('should accept surgical category', () => {
      const category: ConsentCategory = 'surgical'
      expect(category).toBe('surgical')
    })

    it('should accept anesthetic category', () => {
      const category: ConsentCategory = 'anesthetic'
      expect(category).toBe('anesthetic')
    })

    it('should accept treatment category', () => {
      const category: ConsentCategory = 'treatment'
      expect(category).toBe('treatment')
    })

    it('should accept marketing category', () => {
      const category: ConsentCategory = 'marketing'
      expect(category).toBe('marketing')
    })
  })

  describe('ConsentStatus', () => {
    it('should accept pending status', () => {
      const status: ConsentStatus = 'pending'
      expect(status).toBe('pending')
    })

    it('should accept signed status', () => {
      const status: ConsentStatus = 'signed'
      expect(status).toBe('signed')
    })

    it('should accept revoked status', () => {
      const status: ConsentStatus = 'revoked'
      expect(status).toBe('revoked')
    })

    it('should accept expired status', () => {
      const status: ConsentStatus = 'expired'
      expect(status).toBe('expired')
    })
  })

  describe('ConsentTemplate', () => {
    it('should create a valid consent template', () => {
      const template: ConsentTemplate = {
        id: 'template-1',
        tenantId: 'clinic-1',
        name: 'Consentimiento Quirúrgico',
        category: 'surgical',
        content: 'Contenido del consentimiento...',
        version: '1.0.0',
        isActive: true,
        requiresSignature: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(template.id).toBe('template-1')
      expect(template.category).toBe('surgical')
      expect(template.requiresSignature).toBe(true)
    })

    it('should allow optional fields', () => {
      const template: ConsentTemplate = {
        id: 'template-1',
        tenantId: 'clinic-1',
        name: 'Basic Consent',
        category: 'treatment',
        content: 'Basic content',
        version: '1.0.0',
        isActive: false,
      }

      expect(template.requiresSignature).toBeUndefined()
      expect(template.description).toBeUndefined()
    })
  })

  describe('ConsentDocument', () => {
    it('should create a signed consent document', () => {
      const document: ConsentDocument = {
        id: 'doc-1',
        templateId: 'template-1',
        petId: 'pet-123',
        clientId: 'user-456',
        status: 'signed',
        signedAt: new Date().toISOString(),
        signedBy: 'John Doe',
      }

      expect(document.status).toBe('signed')
      expect(document.signedAt).toBeDefined()
    })

    it('should track signature method', () => {
      const document: ConsentDocument = {
        id: 'doc-1',
        templateId: 'template-1',
        petId: 'pet-123',
        clientId: 'user-456',
        status: 'signed',
        signedAt: new Date().toISOString(),
        signedBy: 'Jane Doe',
        signatureMethod: 'digital',
      }

      expect(document.signatureMethod).toBe('digital')
    })
  })
})
