import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { InvoiceForm } from '@/components/invoices/invoice-form'
import { getClinicServices, getClinicPets } from '@/app/actions/invoices'

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function NewInvoicePage({ params }: Props) {
  const { clinic } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  // Fetch services and pets
  const [servicesResult, petsResult] = await Promise.all([
    getClinicServices(clinic),
    getClinicPets(clinic)
  ])

  const services = 'data' in servicesResult ? servicesResult.data : []
  const pets = 'data' in petsResult ? petsResult.data : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${clinic}/dashboard/invoices`}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Nueva Factura
          </h1>
          <p className="text-[var(--text-secondary)]">
            Crea una nueva factura para un cliente
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <InvoiceForm
          clinic={clinic}
          pets={pets}
          services={services}
          mode="create"
        />
      </div>
    </div>
  )
}
