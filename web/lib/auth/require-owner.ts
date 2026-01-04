import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface OwnerUser {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    tenant_id: string
    role: string
    full_name: string | null
  }
  isOwner: boolean
}

/**
 * Requires user to be authenticated as a pet owner.
 * Optionally verifies they belong to a specific tenant.
 *
 * @param tenantId - Optional tenant ID to verify access
 * @returns Owner user data with profile information
 * @throws Redirects to login if not authenticated, or to clinic home if wrong tenant
 */
export async function requireOwner(tenantId?: string): Promise<OwnerUser> {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  // Verify tenant access if specified
  if (tenantId && profile.tenant_id !== tenantId) {
    redirect(`/${profile.tenant_id}`)
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: {
      id: profile.id,
      tenant_id: profile.tenant_id,
      role: profile.role,
      full_name: profile.full_name,
    },
    isOwner: profile.role === 'owner',
  }
}
