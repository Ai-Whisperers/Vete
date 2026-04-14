import { StaffRoleService } from '@/lib/domain/staff-roles/service'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const service = new StaffRoleService(supabase)

  const roles = await service.getRoles()

  return new Response(JSON.stringify(roles), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST({ request }) {
  const supabase = await createClient()
  const service = new StaffRoleService(supabase)

  const role = await request.json()

  const newRole = await service.createRole(role)

  return new Response(JSON.stringify(newRole), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  })
}

### Permission Matrix

We need to create a permission matrix to manage staff roles and permissions.