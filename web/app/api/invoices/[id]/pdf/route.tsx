import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDFDocument } from '@/components/invoices/invoice-pdf'
import { Invoice } from '@/lib/types/invoicing'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await params

  // 1. Auth Check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // 2. Fetch Invoice
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items (
        *,
        services (name)
      ),
      payments (
        *,
        receiver:profiles!payments_received_by_fkey(full_name)
      ),
      pets (
        *,
        owner:profiles!pets_owner_id_fkey (*)
      ),
      created_by_user:profiles!invoices_created_by_fkey (full_name)
    `
    )
    .eq('id', id)
    .single()

  if (error || !invoice) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  // 3. Authorization (Tenant check)
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  if (invoice.tenant_id !== profile?.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // 4. Get Clinic Info
  const { data: clinic } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', invoice.tenant_id)
    .single()

  const clinicName = clinic?.name || 'Veterinaria'

  // 5. Render PDF
  try {
    const stream = await renderToStream(
      <InvoicePDFDocument invoice={invoice as unknown as Invoice} clinicName={clinicName} />
    )

    // Create response with stream
    // Next.js (App Router) response from stream
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF Generation Error:', err)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
