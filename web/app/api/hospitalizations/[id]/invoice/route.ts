import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateHospitalizationInvoice } from '@/lib/billing/hospitalization'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/hospitalizations/[id]/invoice - Generate invoice from hospitalization
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await params

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const result = await generateHospitalizationInvoice(supabase, id, profile.tenant_id, user.id)

    if (!result.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: result.error },
      })
    }

    // Audit log (using the shared logic logic implicitly or explicit here if not in lib)
    // The previous implementation had logAudit. The lib doesn't have it to keep it pure business logic.
    // So we invoke it here.

    const { logAudit } = await import('@/lib/audit')
    await logAudit('CREATE_INVOICE_FROM_HOSPITALIZATION', `invoices/${result.invoice.id}`, {
      invoice_number: result.invoice.invoice_number,
      hospitalization_id: id,
      total: result.invoice.total,
    })

    return NextResponse.json(
      {
        success: true,
        invoice: result.invoice,
        message: 'Factura generada exitosamente',
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('Error generating hospitalization invoice:', e)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
