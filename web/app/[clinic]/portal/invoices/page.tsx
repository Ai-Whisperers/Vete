import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download } from 'lucide-react'

export const metadata = {
  title: 'Facturas | Portal Clínico',
}

interface InvoicesPageProps {
  params: Promise<{ clinic: string }>
}

export default async function InvoicesPage({ params }: InvoicesPageProps) {
  const supabase = await createClient()
  const { clinic } = await params

  // Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login?returnTo=/${clinic}/portal/invoices`)
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(`/${clinic}/portal/login`)
  }

  // Fetch invoices for this user in this clinic
  // Handling the case where the table might be invoices or payments
  let userInvoices: any[] = []
  
  try {
    const { data } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_amount, issue_date, due_date')
      .eq('client_id', user.id)
      .eq('tenant_id', profile.tenant_id)
      .order('issue_date', { ascending: false })
      
    if (data) {
      userInvoices = data
    }
  } catch (e) {
    // Table might not exist or schema differs, fallback to empty array
    console.warn('Invoices table not found or query failed', e)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${clinic}/portal`}
          className="mb-4 inline-flex items-center gap-2 text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al portal
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Facturación y Pagos</h1>
            <p className="text-[var(--text-muted)]">Revisa tus facturas y comprobantes</p>
          </div>
        </div>
      </div>

      {userInvoices.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white dark:bg-[#1a1c23]">
          <ul className="divide-y divide-[var(--border-light)]">
            {userInvoices.map((invoice) => (
              <li key={invoice.id} className="p-4 sm:px-6 hover:bg-black/5 dark:hover:bg-white/5 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Factura #{invoice.invoice_number}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Emitida el {new Date(invoice.issue_date).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">
                        Gs. {Number(invoice.total_amount).toLocaleString('es-PY')}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {invoice.status === 'paid' ? 'Pagado' : invoice.status === 'pending' ? 'Pendiente' : 'Vencido'}
                      </span>
                    </div>
                    <button className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--primary)] transition">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
            <FileText className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">No hay facturas registradas</h3>
          <p className="mx-auto max-w-md text-[var(--text-muted)]">
            Aún no tienes facturas o comprobantes de pago asociados a tu cuenta. Aparecerán aquí después de tu próxima visita a la clínica.
          </p>
        </div>
      )}
    </div>
  )
}
