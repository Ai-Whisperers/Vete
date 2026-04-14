export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'login'
  | 'logout'
  | 'password_change'
  | 'permission_change'

export interface AuditFilter {
  user_id?: string
  action?: AuditAction
  resource_type?: string
  resource_id?: string
  from_date?: string
  to_date?: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  action: AuditAction
  resource_type: string
  resource_id: string
  details: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}