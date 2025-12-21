import { createClient } from '@/lib/supabase/server'
import type { ActionResult, FieldErrors } from '@/lib/types/action-result'

export interface ActionContext {
  user: { id: string; email?: string }
  profile: { id: string; tenant_id: string; role: string; full_name: string }
  isStaff: boolean
  isAdmin: boolean
  supabase: Awaited<ReturnType<typeof createClient>>
}

type AuthenticatedAction<T, Args extends unknown[]> = (
  context: ActionContext,
  ...args: Args
) => Promise<ActionResult<T>>

interface ActionAuthOptions {
  requireStaff?: boolean
  requireAdmin?: boolean
  tenantId?: string
}

/**
 * Wraps a server action with automatic authentication and authorization.
 * IMPORTANT: The file using this wrapper MUST have 'use server' at the top.
 */
export function withActionAuth<T = void, Args extends unknown[] = []>(
  action: AuthenticatedAction<T, Args>,
  options: ActionAuthOptions = {}
) {
  return async (...args: Args): Promise<ActionResult<T>> => {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' }
    }

    const isStaff = ['vet', 'admin'].includes(profile.role)
    const isAdmin = profile.role === 'admin'

    if (options.requireStaff && !isStaff) {
      return { success: false, error: 'Acceso denegado' }
    }

    if (options.requireAdmin && !isAdmin) {
      return { success: false, error: 'Acceso denegado' }
    }

    if (options.tenantId && profile.tenant_id !== options.tenantId) {
      return { success: false, error: 'Acceso denegado' }
    }

    try {
      return await action({ user, profile, isStaff, isAdmin, supabase }, ...args)
    } catch (error) {
      console.error('Action error:', error)
      return { success: false, error: 'Error interno' }
    }
  }
}

export type { ActionResult, FieldErrors }
