import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Invoice,
  InvoiceWithDetails,
  InvoiceListFilters,
  InvoiceListResult,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from './types'

export class InvoiceRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get the Supabase client for complex queries
   */
  getClient(): SupabaseClient {
    return this.supabase
  }

  /**
   * Find invoice by ID with full details
   */
  async findById(
    id: string,
    tenantId: string
  ): Promise<InvoiceWithDetails | null> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(
        `
        *,
        pets (
          id,
          name,
          species,
          breed,
          photo_url,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        ),
        invoice_items (
          id,
          service_id,
          product_id,
          description,
          quantity,
          unit_price,
          discount_amount,
          total,
          services (
            id,
            name,
            category
          ),
          products (
            id,
            name,
            sku
          )
        ),
        payments (
          id,
          amount,
          payment_method_name,
          reference_number,
          payment_date
        ),
        refunds (
          id,
          amount,
          reason,
          created_at
        ),
        created_by_user:profiles!invoices_created_by_fkey (
          full_name
        )
      `
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null

    return {
      ...data,
      pet: data.pets,
      invoice_items: data.invoice_items,
      payments: data.payments,
      refunds: data.refunds,
      created_by_user: data.created_by_user,
    }
  }

  /**
   * List invoices with filters and pagination
   */
  async findMany(
    tenantId: string,
    filters: InvoiceListFilters = {}
  ): Promise<InvoiceListResult> {
    const {
      status,
      petId,
      ownerId,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
    } = filters
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('invoices')
      .select(
        `
        *,
        pets (
          id,
          name,
          species,
          breed,
          photo_url,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        ),
        invoice_items (
          id,
          service_id,
          product_id,
          description,
          quantity,
          unit_price,
          discount_amount,
          total,
          services (
            id,
            name,
            category
          ),
          products (
            id,
            name,
            sku
          )
        ),
        payments (
          id,
          amount,
          payment_method_name,
          reference_number,
          payment_date
        ),
        refunds (
          id,
          amount,
          reason,
          created_at
        ),
        created_by_user:profiles!invoices_created_by_fkey (
          full_name
        )
      `
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (petId) {
      query = query.eq('pet_id', petId)
    }
    if (ownerId) {
      query = query.eq('client_id', ownerId)
    }
    if (fromDate) {
      query = query.gte('created_at', fromDate)
    }
    if (toDate) {
      query = query.lte('created_at', toDate)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error al cargar facturas: ${error.message}`)
    }

    return {
      invoices: data?.map((invoice) => ({
        ...invoice,
        pet: invoice.pets,
        invoice_items: invoice.invoice_items,
        payments: invoice.payments,
        refunds: invoice.refunds,
        created_by_user: invoice.created_by_user,
      })),
      count: count || 0,
      page,
      limit,
    }
  }

  /**
   * Create new invoice
   */
  async create(
    input: CreateInvoiceInput,
    userId: string,
    tenantId: string
  ): Promise<Invoice> {
    const { pet_id, items, tax_rate, notes, due_date, idempotency_key } = input

    // Validate required fields
    if (!pet_id) {
      throw new Error('Se requiere mascota')
    }
    if (!items || items.length === 0) {
      throw new Error('La factura debe tener al menos un item')
    }

    // Check for idempotent request
    if (idempotency_key) {
      const { data: existing } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('idempotency_key', idempotency_key)
        .single()
      if (existing) {
        return existing as unknown as Invoice
      }
    }

    // Verify pet belongs to tenant
    const { data: pet, error: petError } = await this.supabase
      .from('pets')
      .select('id, tenant_id, owner_id')
      .eq('id', pet_id)
      .eq('tenant_id', tenantId)
      .single()

    if (petError || !pet) {
      throw new Error('Mascota no encontrada o no pertenece a esta clínica')
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(tenantId)

    // Calculate totals
    let subtotal = 0
    const processedItems = items.map((item) => {
      const discount = item.discount_percent || 0
      const lineTotal = item.quantity * item.unit_price * (1 - discount / 100)
      subtotal += lineTotal
      return {
        service_id: item.service_id || null,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.quantity * item.unit_price * (discount / 100),
        total: lineTotal,
      }
    })

    const taxAmount = subtotal * (tax_rate || 0) / 100
    const totalAmount = subtotal + taxAmount

    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([
        {
          tenant_id: tenantId,
          client_id: pet.owner_id,
          pet_id: pet_id,
          invoice_number: invoiceNumber,
          subtotal: subtotal,
          tax_rate: tax_rate || 0,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'draft',
          due_date: due_date,
          notes: notes,
          idempotency_key: idempotency_key,
          created_by: userId,
        },
      ])

    if (invoiceError) {
      throw new Error(`Error al crear factura: ${invoiceError.message}`)
    }

    // Create invoice items
    await this.supabase
      .from('invoice_items')
      .insert(
        processedItems.map((item) => ({
          invoice_id: invoice[0].id,
          service_id: item.service_id,
          product_id: item.product_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          total: item.total,
        }))
      )

    return invoice[0] as unknown as Invoice
  }

  /**
   * Update invoice
   */
  async update(
    id: string,
    input: UpdateInvoiceInput,
    userId: string,
    tenantId: string
  ): Promise<Invoice> {
    const { status, notes, internal_notes } = input

    // Update invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .update({
        status: status,
        notes: notes,
        internal_notes: internal_notes,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (invoiceError) {
      throw new Error(`Error al actualizar factura: ${invoiceError.message}`)
    }

    return invoice as unknown as Invoice
  }

  /**
   * Generate invoice number
   */
  async generateInvoiceNumber(tenantId: string): Promise<string> {
    const { data: lastInvoice, error: lastInvoiceError } = await this.supabase
      .from('invoices')
      .select('invoice_number')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastInvoiceError) {
      throw new Error(`Error al generar número de factura: ${lastInvoiceError.message}`)
    }

    const lastInvoiceNumber = lastInvoice?.invoice_number || 'INV-000001'
    const nextInvoiceNumber = `INV-${String(Number(lastInvoiceNumber.slice(4)) + 1).padStart(6, '0')}`

    return nextInvoiceNumber
  }
}