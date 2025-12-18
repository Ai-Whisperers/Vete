import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { getInvoice } from '@/app/actions/invoices'

interface Props {
  params: Promise<{ clinic: string; id: string }>
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { clinic, id } = await params
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

  // Fetch invoice and clinic name
  const [invoiceResult, tenantResult] = await Promise.all([
    getInvoice(id),
    supabase.from('tenants').select('name').eq('id', clinic).single()
  ])

  if ('error' in invoiceResult) {
    notFound()
  }

  const invoice = invoiceResult.data
  const clinicName = tenantResult.data?.name || clinic

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href={`/${clinic}/dashboard/invoices`}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Volver a facturas
        </Link>
      </div>

      <InvoiceDetail
        invoice={invoice}
        clinic={clinic}
        clinicName={clinicName}
        isAdmin={profile.role === 'admin'}
      />
    </div>
  )
}
