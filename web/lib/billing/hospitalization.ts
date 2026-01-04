import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export interface InvoiceResult {
  success: boolean
  invoice?: any // strict typing would be better
  error?: string
}

export async function generateHospitalizationInvoice(
  supabase: SupabaseClient,
  hospitalizationId: string,
  tenantId: string,
  userId: string
): Promise<InvoiceResult> {
  // 1. Get hospitalization details
  const { data: hospitalization, error: hospError } = await supabase
    .from('hospitalizations')
    .select(
      `
      *,
      pet:pets!inner(
        id, name, species, breed, tenant_id,
        owner:profiles!pets_owner_id_fkey(id, full_name, email, phone)
      ),
      kennel:kennels(id, kennel_number, kennel_type, daily_rate, icu_surcharge),
      treatments:hospitalization_treatments(
        id, treatment_type, medication_name, dosage,
        administered_at, status, unit_cost
      ),
      vitals:hospitalization_vitals(id)
    `
    )
    .eq('id', hospitalizationId)
    .single()

  if (hospError || !hospitalization) {
    return { success: false, error: 'Hospitalización no encontrada' }
  }

  // 2. Check if already invoiced (skip check if we want to allow re-billing? No, strict.)
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('hospitalization_id', hospitalizationId)
    .neq('status', 'cancelled') // Allow if previous was cancelled
    .single()

  if (existingInvoice) {
    return {
      success: false,
      error: 'Ya existe una factura activa para esta hospitalización',
      invoice: existingInvoice,
    }
  }

  // 3. Calculate stay duration
  const admissionDate = new Date(hospitalization.admission_date || hospitalization.admitted_at)
  const dischargeDate = hospitalization.discharge_date
    ? new Date(hospitalization.discharge_date)
    : new Date()

  const stayDays = Math.max(
    1,
    Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  const items: Array<{
    description: string
    quantity: number
    unit_price: number
    line_total: number
  }> = []

  // 4. Calculate Items

  // Kennel Charge
  const dailyRate = hospitalization.kennel?.daily_rate || hospitalization.daily_rate || 0
  if (dailyRate > 0) {
    const kennelType = hospitalization.kennel?.kennel_type || 'standard'
    items.push({
      description: `Internación ${kennelType} - ${stayDays} día${stayDays > 1 ? 's' : ''} (Jaula ${hospitalization.kennel?.kennel_number || 'N/A'})`,
      quantity: stayDays,
      unit_price: dailyRate,
      line_total: stayDays * dailyRate,
    })
  }

  // ICU Surcharge
  const icuSurcharge = hospitalization.kennel?.icu_surcharge || 0
  if (icuSurcharge > 0 && hospitalization.acuity_level === 'critical') {
    items.push({
      description: 'Recargo UCI - Cuidados intensivos',
      quantity: stayDays,
      unit_price: icuSurcharge,
      line_total: stayDays * icuSurcharge,
    })
  }

  // Treatments
  const administeredTreatments = (hospitalization.treatments || []).filter(
    (t: any) => t.status === 'administered'
  )

  const treatmentGroups = new Map<string, { count: number; unitCost: number }>()
  for (const treatment of administeredTreatments) {
    const key = treatment.medication_name || treatment.treatment_type
    const existing = treatmentGroups.get(key)
    const unitCost = treatment.unit_cost || 0

    if (existing) {
      existing.count++
      if (unitCost > existing.unitCost) existing.unitCost = unitCost
    } else {
      treatmentGroups.set(key, { count: 1, unitCost })
    }
  }

  for (const [name, { count, unitCost }] of treatmentGroups) {
    if (unitCost > 0) {
      items.push({
        description: `${name} (×${count} dosis)`,
        quantity: count,
        unit_price: unitCost,
        line_total: count * unitCost,
      })
    }
  }

  // Monitoring
  const vitalsCount = hospitalization.vitals?.length || 0
  if (vitalsCount > 0) {
    const monitoringFee = 15000
    items.push({
      description: `Monitoreo de signos vitales (${vitalsCount} controles)`,
      quantity: vitalsCount,
      unit_price: monitoringFee,
      line_total: vitalsCount * monitoringFee,
    })
  }

  // Totals
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  const taxRate = 10
  const taxAmount = Math.round((subtotal * taxRate) / 100)
  const total = subtotal + taxAmount

  // DB Insert
  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
    p_tenant_id: tenantId,
  })

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      invoice_number: invoiceNumber || `INV-HOSP-${Date.now()}`,
      pet_id: hospitalization.pet.id,
      owner_id: hospitalization.pet.owner.id,
      hospitalization_id: hospitalizationId,
      status: 'draft',
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      amount_paid: 0,
      amount_due: total,
      notes: `Factura generada de hospitalización ${hospitalization.hospitalization_number || hospitalizationId}`,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
    })
    .select()
    .single()

  if (invoiceError) {
    return { success: false, error: 'Error al crear regisro de factura: ' + invoiceError.message }
  }

  // Insert items
  const invoiceItems = items.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: 0,
    line_total: item.line_total,
  }))

  const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)

  if (itemsError) {
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return { success: false, error: 'Error al crear items de factura' }
  }

  return { success: true, invoice }
}
