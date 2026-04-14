import type { SupabaseClient } from '@supabase/supabase-js'
import type { StaffMember } from './types'

export class StaffMemberRepository {
  constructor(private supabase: SupabaseClient) {}

  async assignRole(staffId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('staff_members')
      .update({ role_id: roleId })
      .eq('id', staffId)

    if (error) {
      throw error
    }
  }
}

### Audit Trail

We need to create an audit trail to track changes to staff roles and permissions.