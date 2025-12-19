'use server'

import { withActionAuth, actionSuccess, actionError } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { sendEmail as sendEmailClient } from '@/lib/email/client'
import {
  generateInvoiceEmail,
  generateInvoiceEmailText,
} from '@/lib/email/templates/invoice-email'
import type {
  InvoiceFormData,
  RecordPaymentData,
  Invoice,
  Service,
  InvoiceStatus,
} from '@/lib/types/invoicing'

// =============================================================================
// CREATE INVOICE
// =============================================================================

/**
 * Create a new invoice
 * Staff only
 */
export const createInvoice = withActionAuth(
  async ({ profile, supabase, user }, formData: InvoiceFormData) => {
    // Validate data
    if (!formData.pet_id) {
      return actionError('Debe seleccionar una mascota')
    }

    if (!formData.items || formData.items.length === 0) {
      return actionError('Debe agregar al menos un item')
    }

    try {
      // Verify pet belongs to clinic
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('id, tenant_id, owner_id')
        .eq('id', formData.pet_id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (petError || !pet) {
        return actionError('Mascota no encontrada')
      }

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
        p_tenant_id: profile.tenant_id,
      })

      // Calculate totals with proper rounding
      const { roundCurrency } = await import('@/lib/types/invoicing')

      let subtotal = 0
      const processedItems = formData.items.map((item) => {
        const lineTotal = roundCurrency(
          item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
        )
        subtotal += lineTotal
        return {
          ...item,
          line_total: lineTotal,
        }
      })

      // Round all currency values to avoid floating point errors
      subtotal = roundCurrency(subtotal)
      const taxRate = formData.tax_rate || 10 // Default 10% IVA
      const taxAmount = roundCurrency(subtotal * (taxRate / 100))
      const total = roundCurrency(subtotal + taxAmount)

      // Create invoice
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
        return actionError('Error al crear la factura')
      }

      // Create invoice items
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
        return actionError('Error al crear los items de la factura')
      }

      // Revalidate paths
      revalidatePath('/[clinic]/dashboard/invoices')

      return actionSuccess(invoice as Invoice)
    } catch (e) {
      console.error('Create invoice exception:', e)
      return actionError('Error inesperado al crear factura')
    }
  },
  { requireStaff: true }
)

// =============================================================================
// UPDATE INVOICE
// =============================================================================

/**
 * Update an existing invoice
 * Staff only - can only update draft invoices
 */
export const updateInvoice = withActionAuth(
  async ({ profile, supabase }, invoiceId: string, formData: InvoiceFormData) => {
    // Validate data
    if (!formData.pet_id) {
      return actionError('Debe seleccionar una mascota')
    }

    if (!formData.items || formData.items.length === 0) {
      return actionError('Debe agregar al menos un item')
    }

    try {
      // Get existing invoice
      const { data: existingInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('id, status, tenant_id')
        .eq('id', invoiceId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (fetchError || !existingInvoice) {
        return actionError('Factura no encontrada')
      }

      // Only allow updating draft invoices
      if (existingInvoice.status !== 'draft') {
        return actionError('Solo se pueden modificar facturas en borrador')
      }

      // Verify pet belongs to clinic
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('id, tenant_id, owner_id')
        .eq('id', formData.pet_id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (petError || !pet) {
        return actionError('Mascota no encontrada')
      }

      // Calculate totals with proper rounding
      const { roundCurrency } = await import('@/lib/types/invoicing')

      let subtotal = 0
      const processedItems = formData.items.map((item) => {
        const lineTotal = roundCurrency(
          item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
        )
        subtotal += lineTotal
        return {
          ...item,
          line_total: lineTotal,
        }
      })

      // Round all currency values to avoid floating point errors
      subtotal = roundCurrency(subtotal)
      const taxRate = formData.tax_rate || 10 // Default 10% IVA
      const taxAmount = roundCurrency(subtotal * (taxRate / 100))
      const total = roundCurrency(subtotal + taxAmount)

      // Update invoice
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
        return actionError('Error al actualizar la factura')
      }

      // Delete existing items and recreate
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
        return actionError('Error al actualizar los items de la factura')
      }

      // Revalidate paths
      revalidatePath('/[clinic]/dashboard/invoices')
      revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

      return actionSuccess(invoice as Invoice)
    } catch (e) {
      console.error('Update invoice exception:', e)
      return actionError('Error inesperado al actualizar factura')
    }
  },
  { requireStaff: true }
)

// =============================================================================
// UPDATE INVOICE STATUS
// =============================================================================

/**
 * Update invoice status
 * Staff only
 */
export const updateInvoiceStatus = withActionAuth(
  async ({ profile, supabase, user }, invoiceId: string, newStatus: InvoiceStatus, notes?: string) => {
    // Get current invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tenant_id')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !invoice) {
      return actionError('Factura no encontrada')
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
      return actionError(`No se puede cambiar de ${invoice.status} a ${newStatus}`)
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
      return actionError('Error al actualizar el estado')
    }

    revalidatePath('/[clinic]/dashboard/invoices')
    revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

    return actionSuccess()
  },
  { requireStaff: true }
)

// =============================================================================
// SEND INVOICE
// =============================================================================

/**
 * Send an invoice (change status to 'sent')
 * Staff only
 */
export const sendInvoice = withActionAuth(
  async ({ profile, supabase, user }, invoiceId: string, sendEmail: boolean = false, emailMessage?: string) => {
    // Get invoice with complete details for email
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select(
        `
        *,
        pets(
          id,
          name,
          species,
          owner:profiles!pets_owner_id_fkey(id, email, full_name)
        ),
        invoice_items(
          id,
          description,
          quantity,
          unit_price,
          discount_percent,
          line_total
        )
      `
      )
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !invoice) {
      return actionError('Factura no encontrada')
    }

    if (!['draft', 'sent', 'partial', 'overdue'].includes(invoice.status)) {
      return actionError('Esta factura no puede ser enviada')
    }

    // Get clinic/tenant info
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', profile.tenant_id)
      .single()

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
      return actionError('Error al enviar la factura')
    }

    // Send email to owner if requested
    if (sendEmail && invoice.pets) {
      const pet = Array.isArray(invoice.pets) ? invoice.pets[0] : invoice.pets
      const owner = pet?.owner
        ? Array.isArray(pet.owner)
          ? pet.owner[0]
          : pet.owner
        : null

      if (owner && owner.email) {
        try {
          // Generate invoice view URL (if applicable)
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const viewUrl = `${baseUrl}/${profile.tenant_id}/portal/invoices/${invoiceId}`

          // Prepare email data
          const emailData = {
            clinicName: tenant?.name || profile.tenant_id,
            ownerName: owner.full_name || 'Cliente',
            petName: pet.name,
            invoiceNumber: invoice.invoice_number,
            invoiceDate: invoice.created_at,
            dueDate: invoice.due_date,
            subtotal: invoice.subtotal,
            taxRate: invoice.tax_rate,
            taxAmount: invoice.tax_amount,
            total: invoice.total,
            amountPaid: invoice.amount_paid,
            amountDue: invoice.amount_due,
            items: invoice.invoice_items || [],
            notes: emailMessage || invoice.notes,
            paymentInstructions:
              'Efectivo, transferencia bancaria o tarjeta de crédito/débito.\nContacta con nosotros para coordinar el pago.',
            viewUrl,
          }

          // Generate email HTML and text
          const html = generateInvoiceEmail(emailData)
          const text = generateInvoiceEmailText(emailData)

          // Send email
          const result = await sendEmailClient({
            to: owner.email,
            subject: `Factura ${invoice.invoice_number} - ${tenant?.name || profile.tenant_id}`,
            html,
            text,
          })

          if (!result.success) {
            console.error('Failed to send invoice email:', result.error)
            // Don't fail the whole operation if email fails
          }
        } catch (emailError) {
          console.error('Exception sending invoice email:', emailError)
          // Don't fail the whole operation if email fails
        }
      } else {
        console.warn('Cannot send email: owner email not found')
      }
    }

    revalidatePath('/[clinic]/dashboard/invoices')
    revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

    return actionSuccess()
  },
  { requireStaff: true }
)

// =============================================================================
// RECORD PAYMENT
// =============================================================================

/**
 * Record a payment for an invoice
 * Staff only
 */
export const recordPayment = withActionAuth(
  async ({ profile, supabase, user }, invoiceId: string, paymentData: RecordPaymentData) => {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total, amount_paid, amount_due, tenant_id')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (invoiceError || !invoice) {
      return actionError('Factura no encontrada')
    }

    // Validate status
    if (invoice.status === 'void' || invoice.status === 'cancelled') {
      return actionError('No se puede registrar pago en una factura anulada o cancelada')
    }

    if (invoice.status === 'paid') {
      return actionError('Esta factura ya está completamente pagada')
    }

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      return actionError('El monto debe ser mayor a 0')
    }

    if (paymentData.amount > invoice.amount_due) {
      return actionError(
        `El monto (${paymentData.amount.toLocaleString()}) excede el saldo pendiente (${invoice.amount_due.toLocaleString()})`
      )
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
        return actionError('Error al registrar el pago')
      }

      // Update invoice totals with proper rounding
      const { roundCurrency } = await import('@/lib/types/invoicing')
      const newAmountPaid = roundCurrency(invoice.amount_paid + paymentData.amount)
      const newAmountDue = roundCurrency(invoice.total - newAmountPaid)
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
        return actionError('Error al actualizar la factura')
      }

      revalidatePath('/[clinic]/dashboard/invoices')
      revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

      return actionSuccess()
    } catch (e) {
      console.error('Record payment exception:', e)
      return actionError('Error inesperado al registrar pago')
    }
  },
  { requireStaff: true }
)

// =============================================================================
// VOID INVOICE
// =============================================================================

/**
 * Void/cancel an invoice
 * Admin only for non-draft, staff for draft
 */
export const voidInvoice = withActionAuth(
  async ({ profile, isAdmin, supabase, user }, invoiceId: string, reason?: string) => {
    // Get invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tenant_id, amount_paid')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !invoice) {
      return actionError('Factura no encontrada')
    }

    // Check status
    if (['void', 'cancelled'].includes(invoice.status)) {
      return actionError('Esta factura ya está anulada')
    }

    // If invoice has payments, only admin can void
    if (invoice.amount_paid > 0 && !isAdmin) {
      return actionError('Solo un administrador puede anular facturas con pagos registrados')
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
        return actionError('Error al anular la factura')
      }
    }

    revalidatePath('/[clinic]/dashboard/invoices')

    return actionSuccess()
  },
  { requireStaff: true }
)

// =============================================================================
// GET DATA
// =============================================================================

/**
 * Get services for a clinic (for service selector)
 */
export const getClinicServices = withActionAuth(
  async ({ profile, supabase }, clinicSlug: string) => {
    if (profile.tenant_id !== clinicSlug) {
      return actionError('No tienes acceso a esta clínica')
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
      return actionError('Error al cargar servicios')
    }

    return actionSuccess(services as Service[])
  },
  { requireStaff: true }
)

/**
 * Get pets for a clinic (for pet selector in invoice form)
 */
export const getClinicPets = withActionAuth(
  async ({ profile, supabase }, clinicSlug: string, search?: string) => {
    if (profile.tenant_id !== clinicSlug) {
      return actionError('No tienes acceso a esta clínica')
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
      return actionError('Error al cargar mascotas')
    }

    // Transform the nested owner data
    const transformedPets = pets?.map((pet) => ({
      ...pet,
      owner: Array.isArray(pet.owner) ? pet.owner[0] : pet.owner,
    }))

    return actionSuccess(transformedPets)
  },
  { requireStaff: true }
)

/**
 * Get invoices for a clinic
 */
export const getInvoices = withActionAuth(
  async ({ profile, supabase }, params: {
    clinic: string
    status: string
    page: number
    limit: number
  }) => {
    if (profile.tenant_id !== params.clinic) {
      return actionError('No tienes acceso a esta clínica')
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
      return actionError('Error al cargar facturas')
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

    return actionSuccess({ data: transformedInvoices as Invoice[], total: count || 0 })
  },
  { requireStaff: true }
)

/**
 * Get single invoice with all details
 */
export const getInvoice = withActionAuth(
  async ({ profile, user, isStaff, supabase }, invoiceId: string) => {
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
      return actionError('Factura no encontrada')
    }

    // Check access
    if (!isStaff && invoice.owner_id !== user.id) {
      return actionError('No tienes acceso a esta factura')
    }

    return actionSuccess(invoice as Invoice)
  }
)
