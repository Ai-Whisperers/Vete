import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { redirect } from 'next/navigation'
import { removeInvite } from '@/app/actions/invite-staff'
import { InviteStaffForm } from '@/components/team/invite-staff-form'

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function DashboardTeamPage({ params }: Props) {
  const { clinic } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Admin check - team management is admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/dashboard`)
  }

  // Fetch invites
  const { data: invites } = await supabase
    .from('clinic_invites')
    .select('*')
    .eq('tenant_id', clinic)
    .order('created_at', { ascending: false })

  // Fetch team members
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .eq('tenant_id', clinic)
    .in('role', ['vet', 'admin'])
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestión de Equipo</h1>
        <p className="text-[var(--text-secondary)]">Administra quién tiene acceso al dashboard veterinario</p>
      </div>

      {/* Invite Form */}
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icons.UserPlus className="w-5 h-5 text-[var(--primary)]" />
          Invitar Nuevo Miembro
        </h2>
        <InviteStaffForm clinic={clinic} />
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-[var(--border)] mb-8">
        <div className="p-4 border-b border-[var(--border-light)]">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Icons.Users className="w-5 h-5 text-[var(--primary)]" />
            Miembros del Equipo
          </h3>
        </div>
        <div className="divide-y divide-[var(--border-light)]">
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                    <Icons.User className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{member.full_name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{member.email}</p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={member.role === 'admin'
                    ? { backgroundColor: "var(--accent-purple-light)", color: "var(--accent-purple-dark)" }
                    : { backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue-dark)" }
                  }
                >
                  {member.role === 'admin' ? 'Administrador' : 'Veterinario'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              No hay miembros del equipo registrados
            </div>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      <div className="bg-white rounded-xl border border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border-light)]">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Icons.Mail className="w-5 h-5 text-[var(--primary)]" />
            Invitaciones Pendientes
          </h3>
        </div>
        <div className="divide-y divide-[var(--border-light)]">
          {invites && invites.length > 0 ? (
            invites.map((invite: any) => (
              <div key={invite.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--status-warning-bg)" }}>
                    <Icons.Clock className="w-5 h-5" style={{ color: "var(--status-warning-dark)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{invite.email}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Rol: {invite.role === 'admin' ? 'Administrador' : 'Veterinario'}
                    </p>
                  </div>
                </div>
                <form action={removeInvite}>
                  <input type="hidden" name="id" value={invite.id} />
                  <input type="hidden" name="clinic" value={clinic} />
                  <button
                    type="submit"
                    className="p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ color: "var(--status-error)" }}
                    title="Cancelar invitación"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              No hay invitaciones pendientes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
