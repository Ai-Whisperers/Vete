import type { SupabaseClient } from '@supabase/supabase-js'
import type { StaffRole, StaffPermission, StaffRolePermission } from './types'

export class StaffRoleRepository {
  constructor(private supabase: SupabaseClient) {}

  async createRole(role: Omit<StaffRole, 'id' | 'created_at' | 'updated_at'>): Promise<StaffRole> {
    const { data, error } = await this.supabase
      .from('staff_roles')
      .insert([role])
      .select('*')

    if (error) {
      throw error
    }

    return data[0]
  }

  async getRoles(): Promise<StaffRole[]> {
    const { data, error } = await this.supabase
      .from('staff_roles')
      .select('*')

    if (error) {
      throw error
    }

    return data
  }

  async createPermission(permission: Omit<StaffPermission, 'id' | 'created_at' | 'updated_at'>): Promise<StaffPermission> {
    const { data, error } = await this.supabase
      .from('staff_permissions')
      .insert([permission])
      .select('*')

    if (error) {
      throw error
    }

    return data[0]
  }

  async getPermissions(): Promise<StaffPermission[]> {
    const { data, error } = await this.supabase
      .from('staff_permissions')
      .select('*')

    if (error) {
      throw error
    }

    return data
  }

  async assignPermission(roleId: string, permissionId: string): Promise<StaffRolePermission> {
    const { data, error } = await this.supabase
      .from('staff_role_permissions')
      .insert([{ role_id: roleId, permission_id: permissionId }])
      .select('*')

    if (error) {
      throw error
    }

    return data[0]
  }

  async getRolePermissions(roleId: string): Promise<StaffPermission[]> {
    const { data, error } = await this.supabase
      .from('staff_role_permissions')
      .select('permission_id')
      .eq('role_id', roleId)

    if (error) {
      throw error
    }

    const permissionIds = data.map((item) => item.permission_id)

    const permissions = await this.supabase
      .from('staff_permissions')
      .select('*')
      .in('id', permissionIds)

    return permissions.data
  }
}

### Service Layer Changes

We need to create a new service layer for staff roles and permissions.