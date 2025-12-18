'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  InvoiceFormData,
  RecordPaymentData,
  Invoice,
  Service,
  InvoiceStatus,
} from '@/lib/types/invoicing'

// =============================================================================
// Result Types
// =============================================================================

interface ActionResult {
  success?: boolean
  error?: string
}

interface InvoiceResult extends ActionResult {
  data?: Invoice
}

interface ServicesResult {
  data?: Service[]
  error?: string
}

// =============================================================================
// CREATE INVOICE
// =============================================================================

/**
 * Create a new invoice
 * Staff only
 */
export async function createInvoice(formData: InvoiceFormData): Promise<InvoiceResult> {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Staff Check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede crear facturas' }
  }

  // 3. Validate data
  if (!formData.pet_id) {
    return { error: 'Debe seleccionar una mascota' }
  }

  if (!formData.items || formData.items.length === 0) {
    return { error: 'Debe agregar al menos un item' }
  }

  try {
    // 4. Verify pet belongs to clinic
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, tenant_id, owner_id')
      .eq('id', formData.pet_id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (petError || !pet) {
      return { error: 'Mascota no encontrada' }
    }

    // 5. Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
      p_tenant_id: profile.tenant_id,
    })

    // 6. Calculate totals
    let subtotal = 0
    const processedItems = formData.items.map((item) => {
      const lineTotal =
        item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
      subtotal += lineTotal
      return {
        ...item,
        line_total: lineTotal,
      }
    })

    const taxRate = formData.tax_rate || 10 // Default 10% IVA
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // 7. Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: profile.tenant_id,
        invoice_number: invoiceNumber || `INV-${Date.now()}`,
        pet_id: formData.pet_id,
        owner_id: pet.owner_id,
        status: 'draft',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        amount_due: total,
        notes: formData.notes,
        due_date:
          formData.due_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        created_by: user.id,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Create invoice error:', invoiceError)
      return { error: 'Error al crear la factura' }
    }

    // 8. Create invoice items
    const invoiceItems = processedItems.map((item) => ({
      invoice_id: invoice.id,
      service_id: item.service_id || null,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      line_total: item.line_total,
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)

    if (itemsError) {
      console.error('Create invoice items error:', itemsError)
      // Rollback invoice
      await supabase.from('invoices').delete().eq('id', invoice.id)
      return { error: 'Error al crear los items de la factura' }
    }

    // 9. Revalidate paths
    revalidatePath('/[clinic]/dashboard/invoices')

    return { success: true, data: invoice as Invoice }
  } catch (e) {
    console.error('Create invoice exception:', e)
    return { error: 'Error inesperado al crear factura' }
  }
}

// =============================================================================
// UPDATE INVOICE
// =============================================================================

/**
 * Update an existing invoice
 * Staff only - can only update draft invoices
 */
export async function updateInvoice(
  invoiceId: string,
  formData: InvoiceFormData
): Promise<InvoiceResult> {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Staff Check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede modificar facturas' }
  }

  // 3. Validate data
  if (!formData.pet_id) {
    return { error: 'Debe seleccionar una mascota' }
  }

  if (!formData.items || formData.items.length === 0) {
    return { error: 'Debe agregar al menos un item' }
  }

  try {
    // 4. Get existing invoice
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tenant_id')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !existingInvoice) {
      return { error: 'Factura no encontrada' }
    }

    // 5. Only allow updating draft invoices
    if (existingInvoice.status !== 'draft') {
      return { error: 'Solo se pueden modificar facturas en borrador' }
    }

    // 6. Verify pet belongs to clinic
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, tenant_id, owner_id')
      .eq('id', formData.pet_id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (petError || !pet) {
      return { error: 'Mascota no encontrada' }
    }

    // 7. Calculate totals
    let subtotal = 0
    const processedItems = formData.items.map((item) => {
      const lineTotal =
        item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
      subtotal += lineTotal
      return {
        ...item,
        line_total: lineTotal,
      }
    })

    const taxRate = formData.tax_rate || 10 // Default 10% IVA
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // 8. Update invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        pet_id: formData.pet_id,
        owner_id: pet.owner_id,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_due: total,
        notes: formData.notes,
        due_date: formData.due_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (invoiceError) {
      console.error('Update invoice error:', invoiceError)
      return { error: 'Error al actualizar la factura' }
    }

    // 9. Delete existing items and recreate
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

    const invoiceItems = processedItems.map((item) => ({
      invoice_id: invoiceId,
      service_id: item.service_id || null,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      line_total: item.line_total,
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)

    if (itemsError) {
      console.error('Update invoice items error:', itemsError)
      return { error: 'Error al actualizar los items de la factura' }
    }

    // 10. Revalidate paths
    revalidatePath('/[clinic]/dashboard/invoices')
    revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

    return { success: true, data: invoice as Invoice }
  } catch (e) {
    console.error('Update invoice exception:', e)
    return { error: 'Error inesperado al actualizar factura' }
  }
}

// =============================================================================
// UPDATE INVOICE STATUS
// =============================================================================

/**
 * Update invoice status
 * Staff only
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: InvoiceStatus,
  notes?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede modificar facturas' }
  }

  // Get current invoice
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, status, tenant_id')
    .eq('id', invoiceId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (fetchError || !invoice) {
    return { error: 'Factura no encontrada' }
  }

  // Validate status transitions
  const validTransitions: Record<string, InvoiceStatus[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['paid', 'partial', 'overdue', 'cancelled'],
    partial: ['paid', 'overdue', 'cancelled'],
    overdue: ['paid', 'partial', 'cancelled'],
    paid: [], // Can't change once paid
    cancelled: [], // Can't change once cancelled
    void: [], // Can't change once voided
  }

  if (!validTransitions[invoice.status]?.includes(newStatus)) {
    return {
      error: `No se puede cambiar de ${invoice.status} a ${newStatus}`,
    }
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (notes) {
    updateData.notes = notes
  }

  if (newStatus === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
    updateData.cancelled_by = user.id
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (updateError) {
    console.error('Update invoice status error:', updateError)
    return { error: 'Error al actualizar el estado' }
  }

  revalidatePath('/[clinic]/dashboard/invoices')
  revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

  return { success: true }
}

// =============================================================================
// SEND INVOICE
// =============================================================================

/**
 * Send an invoice (change status to 'sent')
 * Staff only
 */
export async function sendInvoice(
  invoiceId: string,
  sendEmail: boolean = false,
  emailMessage?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede enviar facturas' }
  }

  // Get invoice with owner info
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select(
      `
      id, 
      status, 
      tenant_id, 
      invoice_number,
      pets(
        owner:profiles!pets_owner_id_fkey(email, full_name)
      )
    `
    )
    .eq('id', invoiceId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (fetchError || !invoice) {
    return { error: 'Factura no encontrada' }
  }

  if (!['draft', 'sent', 'partial', 'overdue'].includes(invoice.status)) {
    return { error: 'Esta factura no puede ser enviada' }
  }

  // Update status to sent
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
      sent_at: new Date().toISOString(),
      sent_by: user.id,
    })
    .eq('id', invoiceId)

  if (updateError) {
    console.error('Send invoice error:', updateError)
    return { error: 'Error al enviar la factura' }
  }

  // TODO: Implement actual email sending
  // If sendEmail is true, send email to owner
  if (sendEmail) {
    // This would integrate with an email service
    console.log('Would send email to owner with message:', emailMessage)
  }

  revalidatePath('/[clinic]/dashboard/invoices')
  revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

  return { success: true }
}

// =============================================================================
// RECORD PAYMENT
// =============================================================================

/**
 * Record a payment for an invoice
 * Staff only
 */
export async function recordPayment(
  invoiceId: string,
  paymentData: RecordPaymentData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede registrar pagos' }
  }

  // Get invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, status, total, amount_paid, amount_due, tenant_id')
    .eq('id', invoiceId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (invoiceError || !invoice) {
    return { error: 'Factura no encontrada' }
  }

  // Validate status
  if (invoice.status === 'void' || invoice.status === 'cancelled') {
    return { error: 'No se puede registrar pago en una factura anulada o cancelada' }
  }

  if (invoice.status === 'paid') {
    return { error: 'Esta factura ya está completamente pagada' }
  }

  // Validate amount
  if (!paymentData.amount || paymentData.amount <= 0) {
    return { error: 'El monto debe ser mayor a 0' }
  }

  if (paymentData.amount > invoice.amount_due) {
    return {
      error: `El monto (${paymentData.amount.toLocaleString()}) excede el saldo pendiente (${invoice.amount_due.toLocaleString()})`,
    }
  }

  try {
    // Create payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      tenant_id: profile.tenant_id,
      invoice_id: invoiceId,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes,
      received_by: user.id,
      paid_at: new Date().toISOString(),
    })

    if (paymentError) {
      console.error('Create payment error:', paymentError)
      return { error: 'Error al registrar el pago' }
    }

    // Update invoice totals
    const newAmountPaid = invoice.amount_paid + paymentData.amount
    const newAmountDue = invoice.total - newAmountPaid
    const newStatus = newAmountDue <= 0 ? 'paid' : 'partial'

    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Update invoice after payment error:', updateError)
      return { error: 'Error al actualizar la factura' }
    }

    revalidatePath('/[clinic]/dashboard/invoices')
    revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

    return { success: true }
  } catch (e) {
    console.error('Record payment exception:', e)
    return { error: 'Error inesperado al registrar pago' }
  }
}

// =============================================================================
// VOID INVOICE
// =============================================================================

/**
 * Void/cancel an invoice
 * Admin only for non-draft, staff for draft
 */
export async function voidInvoice(invoiceId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede anular facturas' }
  }

  // Get invoice
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, status, tenant_id, amount_paid')
    .eq('id', invoiceId)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (fetchError || !invoice) {
    return { error: 'Factura no encontrada' }
  }

  // Check status
  if (['void', 'cancelled'].includes(invoice.status)) {
    return { error: 'Esta factura ya está anulada' }
  }

  // If invoice has payments, only admin can void
  if (invoice.amount_paid > 0 && profile.role !== 'admin') {
    return { error: 'Solo un administrador puede anular facturas con pagos registrados' }
  }

  // Draft invoices can be deleted
  if (invoice.status === 'draft') {
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)
    await supabase.from('invoices').delete().eq('id', invoiceId)
  } else {
    // Non-draft invoices are voided (soft delete)
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'void',
        voided_at: new Date().toISOString(),
        voided_by: user.id,
        notes: reason ? `[Anulada] ${reason}` : '[Factura anulada]',
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Void invoice error:', updateError)
      return { error: 'Error al anular la factura' }
    }
  }

  revalidatePath('/[clinic]/dashboard/invoices')

  return { success: true }
}

// =============================================================================
// GET DATA
// =============================================================================

/**
 * Get services for a clinic (for service selector)
 */
export async function getClinicServices(clinicSlug: string): Promise<ServicesResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede ver servicios' }
  }

  if (profile.tenant_id !== clinicSlug) {
    return { error: 'No tienes acceso a esta clínica' }
  }

  const { data: services, error } = await supabase
    .from('services')
    .select('id, tenant_id, name, description, category, base_price, duration_minutes, is_active')
    .eq('tenant_id', clinicSlug)
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (error) {
    console.error('Get services error:', error)
    return { error: 'Error al cargar servicios' }
  }

  return { data: services as Service[] }
}

/**
 * Get pets for a clinic (for pet selector in invoice form)
 */
export async function getClinicPets(clinicSlug: string, search?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', data: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede ver mascotas', data: null }
  }

  if (profile.tenant_id !== clinicSlug) {
    return { error: 'No tienes acceso a esta clínica', data: null }
  }

  let query = supabase
    .from('pets')
    .select(
      `
      id, 
      name, 
      species, 
      breed,
      photo_url,
      owner:profiles!pets_owner_id_fkey(id, full_name, email, phone)
    `
    )
    .eq('tenant_id', clinicSlug)
    .order('name')
    .limit(50)

  if (search) {
    query = query.or(`name.ilike.%${search}%`)
  }

  const { data: pets, error } = await query

  if (error) {
    console.error('Get pets error:', error)
    return { error: 'Error al cargar mascotas', data: null }
  }

  // Transform the nested owner data
  const transformedPets = pets?.map((pet) => ({
    ...pet,
    owner: Array.isArray(pet.owner) ? pet.owner[0] : pet.owner,
  }))

  return { data: transformedPets, error: null }
}

/**
 * Get invoices for a clinic
 */
export async function getInvoices(params: {
  clinic: string
  status: string
  page: number
  limit: number
}): Promise<{ data: Invoice[]; total: number } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { error: 'Solo el personal puede ver facturas' }
  }

  if (profile.tenant_id !== params.clinic) {
    return { error: 'No tienes acceso a esta clínica' }
  }

  const offset = (params.page - 1) * params.limit

  let query = supabase
    .from('invoices')
    .select(
      `
      *,
      pets(id, name, species, photo_url, owner:profiles!pets_owner_id_fkey(id, full_name, email, phone))
    `,
      { count: 'exact' }
    )
    .eq('tenant_id', params.clinic)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.limit - 1)

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: invoices, error, count } = await query

  if (error) {
    console.error('Get invoices error:', error)
    return { error: 'Error al cargar facturas' }
  }

  // Transform nested data
  const transformedInvoices = invoices?.map((inv) => {
    const pets = Array.isArray(inv.pets) ? inv.pets[0] : inv.pets
    const owner = pets?.owner ? (Array.isArray(pets.owner) ? pets.owner[0] : pets.owner) : undefined
    return {
      ...inv,
      pets: pets ? { ...pets, owner } : undefined,
    }
  }) || []

  return { data: transformedInvoices as Invoice[], total: count || 0 }
}

/**
 * Get single invoice with all details
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Perfil no encontrado' }
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(
      `
      *,
      pets(id, name, species, breed, photo_url, owner:profiles!pets_owner_id_fkey(id, full_name, email, phone)),
      invoice_items(
        id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total,
        services(id, name, category),
        products(id, name, sku)
      ),
      payments(id, amount, payment_method, reference_number, paid_at, received_by),
      refunds(id, amount, reason, refunded_at),
      created_by_user:profiles!invoices_created_by_fkey(full_name)
    `
    )
    .eq('id', invoiceId)
    .single()

  if (error) {
    console.error('Get invoice error:', error)
    return { error: 'Factura no encontrada' }
  }

  // Check access
  const isStaff = ['vet', 'admin'].includes(profile.role)
  if (!isStaff && invoice.owner_id !== user.id) {
    return { error: 'No tienes acceso a esta factura' }
  }

  return { data: invoice as Invoice }
}
