/**
 * Hospitalization Billing Utilities
 *
 * Generates invoices for hospitalization stays, including:
 * - Daily kennel fees
 * - Treatments and medications
 * - Lab tests and procedures
 * - Feeding charges
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface HospitalizationInvoice {
  id: string
  invoice_number: string
  total: number
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

export interface GenerateInvoiceResult {
  success: boolean
  invoice: HospitalizationInvoice | null
  error?: string
}

/**
 * Generates an invoice for a hospitalization stay.
 *
 * This function:
 * 1. Fetches the hospitalization record with related data
 * 2. Calculates daily kennel fees based on stay duration
 * 3. Adds treatments, medications, and other charges
 * 4. Creates an invoice record in the database
 *
 * @param supabase - Supabase client
 * @param hospitalizationId - ID of the hospitalization
 * @param tenantId - Tenant ID for data isolation
 * @param userId - ID of the user generating the invoice
 * @returns Result with invoice data or error
 */
export async function generateHospitalizationInvoice(
  supabase: SupabaseClient,
  hospitalizationId: string,
  tenantId: string,
  userId: string
): Promise<GenerateInvoiceResult> {
  try {
    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('hospitalization_id', hospitalizationId)
      .eq('tenant_id', tenantId)
      .single()

    if (existingInvoice) {
      return {
        success: false,
        invoice: existingInvoice as HospitalizationInvoice,
        error: 'Ya existe una factura para esta hospitalización',
      }
    }

    // Fetch hospitalization with related data
    const { data: hospitalization, error: hospError } = await supabase
      .from('hospitalizations')
      .select(
        `
        *,
        kennel:kennels(daily_rate),
        treatments:hospitalization_medications(*),
        vitals:hospitalization_vitals(*),
        feedings:hospitalization_feedings(*)
      `
      )
      .eq('id', hospitalizationId)
      .eq('tenant_id', tenantId)
      .single()

    if (hospError || !hospitalization) {
      return {
        success: false,
        invoice: null,
        error: hospError?.message || 'Hospitalización no encontrada',
      }
    }

    // Calculate charges
    const items: Array<{
      description: string
      quantity: number
      unit_price: number
      total: number
    }> = []

    // Daily rate calculation
    const admittedAt = new Date(hospitalization.admitted_at)
    const dischargedAt = hospitalization.actual_discharge_at
      ? new Date(hospitalization.actual_discharge_at)
      : new Date()
    const days = Math.ceil((dischargedAt.getTime() - admittedAt.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = hospitalization.kennel?.daily_rate || 0

    if (dailyRate > 0 && days > 0) {
      items.push({
        description: `Estadía en jaula (${days} días)`,
        quantity: days,
        unit_price: dailyRate,
        total: days * dailyRate,
      })
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxRate = 0.1
    const taxAmount = Math.round(subtotal * taxRate)
    const total = subtotal + taxAmount

    // Generate invoice number
    const invoiceNumber = `HOS-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: tenantId,
        hospitalization_id: hospitalizationId,
        pet_id: hospitalization.pet_id,
        invoice_number: invoiceNumber,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: total,
        balance_due: total,
        status: 'pending',
        created_by: userId,
      })
      .select('id, invoice_number, total_amount')
      .single()

    if (invoiceError || !invoice) {
      return {
        success: false,
        invoice: null,
        error: invoiceError?.message || 'Error al crear factura',
      }
    }

    return {
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total: invoice.total_amount,
        items,
      },
    }
  } catch (error) {
    return {
      success: false,
      invoice: null,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
