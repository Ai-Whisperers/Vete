import { describe, it, expect } from 'vitest'
import type { UserProfile, UserRole } from '@/lib/domain/users/types'

describe('UserProfile Types', () => {
  describe('UserRole', () => {
    it('should accept owner role', () => {
      const role: UserRole = 'owner'
      expect(role).toBe('owner')
    })

    it('should accept vet role', () => {
      const role: UserRole = 'vet'
      expect(role).toBe('vet')
    })

    it('should accept admin role', () => {
      const role: UserRole = 'admin'
      expect(role).toBe('admin')
    })
  })

  describe('UserProfile', () => {
    it('should create a minimal user profile', () => {
      const profile: UserProfile = {
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@test.com',
        role: 'owner',
        tenant_id: 'clinic-1',
      }

      expect(profile.id).toBe('user-1')
      expect(profile.role).toBe('owner')
    })

    it('should allow optional fields', () => {
      const profile: UserProfile = {
        id: 'user-1',
        full_name: 'Test User',
        email: 'test@test.com',
        role: 'vet',
        tenant_id: 'clinic-1',
        phone: '+595123456789',
        avatar_url: null,
      }

      expect(profile.phone).toBeDefined()
      expect(profile.avatar_url).toBeNull()
    })

    it('should allow platform admin flag', () => {
      const profile: UserProfile = {
        id: 'user-1',
        full_name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        tenant_id: 'clinic-1',
        is_platform_admin: true,
      }

      expect(profile.is_platform_admin).toBe(true)
    })
  })
})
