import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import AppointmentForm from './appointment-form'

export default async function NewAppointmentPage({ params }: { params: Promise<{ clinic: string }> }) {
  const supabase = await createClient()
  const { clinic } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${clinic}/portal/login`)

  // Fetch Owner's Pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, photo_url')
    .eq('owner_id', user.id)
    .eq('tenant_id', clinic) // Ensure correct clinic context
  
  if (!pets || pets.length === 0) {
      return (
          <div className="max-w-xl mx-auto py-12 text-center">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">No tienes mascotas registradas</h1>
              <p className="text-gray-500 mb-6">Debes registrar una mascota antes de agendar una cita.</p>
              <Link href={`/${clinic}/portal/pets/new`} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Icons.Plus className="w-5 h-5" /> Registrar Mascota
              </Link>
          </div>
      )
  }

  return (
    <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors">
                <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>
            <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Agendar Cita</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <AppointmentForm pets={pets} clinic={clinic} />
        </div>
    </div>
  )
}
