import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateHospitalizationInvoice } from '@/lib/billing/hospitalization'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/hospitalizations/[id]/discharge
// Atomic operations: Generate Invoice -> Discharge Patient -> Free Kennel
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await params

  // 1. Authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // 2. Authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    // 3. Generate Invoice First (The Money Fix)
    // We attempt to generate the invoice. If it fails (e.g. already invoiced), we proceed to discharge
    // ONLY if the error is "Already invoiced". If it's another error, we halt.

    // Note: In strict mode, we might want to FAIL if already invoiced to prevent confusion,
    // but practically, if a vet printed the invoice manually 5 mins ago, they should still be able to discharge.

    const invoiceResult = await generateHospitalizationInvoice(
      supabase,
      id,
      profile.tenant_id,
      user.id
    )

    let finalInvoice = invoiceResult.invoice

    if (!invoiceResult.success) {
      // If error is NOT "already exists", we abort discharge to prevent revenue loss.
      // We check the error message string (brittle but effective for now)
      if (invoiceResult.error && !invoiceResult.error.includes('Ya existe una factura')) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { reason: 'invoice_generation_failed', message: invoiceResult.error },
        })
      }

      // If invoice exists, we fetch it just to return it in response
      if (invoiceResult.invoice) {
        finalInvoice = invoiceResult.invoice
      }
    }

    // 4. Update Hospitalization Status (Discharge)
    const { data: hosp, error: updateError } = await supabase
      .from('hospitalizations')
      .update({
        status: 'discharged',
        discharge_date: new Date().toISOString(),
        discharged_by: user.id,
      })
      .eq('id', id)
      .eq('pet.tenant_id', profile.tenant_id) // Indirect tenant check via RLS, but handy
      .select('kennel_id')
      .single()

    if (updateError) {
      console.error('Error updating hospitalization:', updateError)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // 5. Free up the Kennel
    if (hosp?.kennel_id) {
      await supabase.from('kennels').update({ status: 'available' }).eq('id', hosp.kennel_id)
    }

    // 6. Log Audit
    const { logAudit } = await import('@/lib/audit')
    await logAudit('DISCHARGE_PATIENT', `hospitalizations/${id}`, {
      invoice_id: finalInvoice?.id,
      invoice_number: finalInvoice?.invoice_number,
    })

    return NextResponse.json({
      success: true,
      message: 'Paciente dado de alta y factura generada correctamente',
      invoice: finalInvoice,
    })
  } catch (e) {
    console.error('Error interacting with database:', e)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
