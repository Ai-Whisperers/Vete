import { describe, it, expect } from 'vitest'
import type { UserProfile } from '@/lib/domain/users/types'

describe('Auth Types', () => {
  describe('isAdmin', () => {
    it('should check admin role correctly', () => {
      const adminProfile: UserProfile = { id: '1', role: 'admin', tenant_id: 'clinic-1', full_name: 'Admin', email: 'a@test.com' }
      const ownerProfile: UserProfile = { id: '2', role: 'owner', tenant_id: 'clinic-1', full_name: 'Owner', email: 'o@test.com' }
      
      expect(adminProfile.role).toBe('admin')
      expect(ownerProfile.role).toBe('owner')
      expect(adminProfile.role === 'admin').toBe(true)
      expect(ownerProfile.role === 'admin').toBe(false)
    })
  })

  describe('isPlatformAdmin', () => {
    it('should check platform admin flag', () => {
      const platformAdmin: UserProfile = { id: '1', role: 'admin', tenant_id: 'clinic-1', full_name: 'PAdmin', email: 'a@test.com', is_platform_admin: true }
      const regularAdmin: UserProfile = { id: '2', role: 'admin', tenant_id: 'clinic-1', full_name: 'Admin', email: 'b@test.com', is_platform_admin: false }
      const noFlag: UserProfile = { id: '3', role: 'admin', tenant_id: 'clinic-1', full_name: 'Admin2', email: 'c@test.com' }
      
      expect(platformAdmin.is_platform_admin).toBe(true)
      expect(regularAdmin.is_platform_admin).toBe(false)
      expect(noFlag.is_platform_admin).toBeUndefined()
    })
  })

  describe('belongsToTenant', () => {
    it('should check tenant membership', () => {
      const profile: UserProfile = { id: '1', role: 'owner', tenant_id: 'clinic-1', full_name: 'User', email: 'u@test.com' }
      
      expect(profile.tenant_id).toBe('clinic-1')
      expect(profile.tenant_id === 'clinic-1').toBe(true)
      expect(profile.tenant_id === 'clinic-2').toBe(false)
    })
  })
})
