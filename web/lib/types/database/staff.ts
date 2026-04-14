export interface StaffRole {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface StaffPermission {
  id: string
  name: string
  description: string
  code: string
  created_at: string
  updated_at: string
}

export interface StaffRolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
  updated_at: string
}

### Domain Layer Changes

We need to create a new domain layer for staff roles and permissions.