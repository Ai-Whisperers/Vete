import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { AppointmentList } from '@/components/appointments'
import { getOwnerAppointments } from '@/app/actions/appointments'

interface PageProps {
  params: Promise<{ clinic: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { clinic } = await params
  return {
    title: `Mis Citas - ${clinic}`,
    description: 'Gestiona tus citas veterinarias'
  }
}

export default async function AppointmentsPage({ params }: PageProps) {
  const { clinic } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Fetch appointments
  const { data, error } = await getOwnerAppointments(clinic)

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 rounded-2xl text-center">
          <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar citas</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/${clinic}/portal/dashboard`}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">
              Mis Citas
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gestiona tus citas veterinarias
            </p>
          </div>
        </div>

        <Link
          href={`/${clinic}/book`}
          className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Cita</span>
        </Link>
      </div>

      {/* Appointment List */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <AppointmentList
          upcoming={data?.upcoming || []}
          past={data?.past || []}
          clinic={clinic}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link
          href={`/${clinic}/portal/pets`}
          className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-[var(--primary)]/30 hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
            <Icons.PawPrint className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Mis Mascotas</h3>
            <p className="text-xs text-[var(--text-secondary)]">Ver perfiles</p>
          </div>
        </Link>

        <Link
          href={`/${clinic}/services`}
          className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-[var(--primary)]/30 hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <Icons.Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Servicios</h3>
            <p className="text-xs text-[var(--text-secondary)]">Ver catálogo</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
