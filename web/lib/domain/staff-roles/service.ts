import { StaffRoleRepository } from './repository'
import type { StaffRole, StaffPermission, StaffRolePermission } from './types'

export class StaffRoleService {
  private repository: StaffRoleRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new StaffRoleRepository(supabase)
  }

  async createRole(role: Omit<StaffRole, 'id' | 'created_at' | 'updated_at'>): Promise<StaffRole> {
    return this.repository.createRole(role)
  }

  async getRoles(): Promise<StaffRole[]> {
    return this.repository.getRoles()
  }

  async createPermission(permission: Omit<StaffPermission, 'id' | 'created_at' | 'updated_at'>): Promise<StaffPermission> {
    return this.repository.createPermission(permission)
  }

  async getPermissions(): Promise<StaffPermission[]> {
    return this.repository.getPermissions()
  }

  async assignPermission(roleId: string, permissionId: string): Promise<StaffRolePermission> {
    return this.repository.assignPermission(roleId, permissionId)
  }

  async getRolePermissions(roleId: string): Promise<StaffPermission[]> {
    return this.repository.getRolePermissions(roleId)
  }
}

### API Route Changes

We need to create new API routes for staff roles and permissions.