import type { SupabaseClient } from '@supabase/supabase-js'
import { InvoiceRepository } from './repository'
import type {
  Invoice,
  InvoiceWithDetails,
  InvoiceListFilters,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceListResult,
} from './types'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'

export class InvoiceService {
  private repository: InvoiceRepository

  constructor(private supabase: SupabaseClient) {
    this.repository = new InvoiceRepository(supabase)
  }

  /**
   * List invoices with access control
   *
   * @param tenantId - Tenant ID
   * @param filters - Filters and pagination
   * @param userId - User ID (for owner access)
   * @param isStaff - Whether user is staff
   */
  async list(
    tenantId: string,
    filters: InvoiceListFilters = {},
    userId?: string,
    isStaff: boolean = true
  ): Promise<InvoiceListResult> {
    // Staff can see all invoices
    if (isStaff) {
      return this.repository.findMany(tenantId, filters)
    }

    // Owners can only see their pets' invoices
    if (userId) {
      const { data: ownerPets } = await this.supabase
        .from('pets')
        .select('id')
        .eq('owner_id', userId)

      const petIds = ownerPets?.map((p) => p.id) || []
      return this.repository.findMany(tenantId, { ...filters, petId: petIds })
    }

    return { invoices: [], count: 0, page: 1, limit: 20 }
  }

  /**
   * Get single invoice with access control
   */
  async getById(
    id: string,
    tenantId: string,
    userId?: string,
    isStaff: boolean = true
  ): Promise<InvoiceWithDetails | null> {
    const invoice = await this.repository.findById(id, tenantId)

    if (!invoice) return null

    // Check access - staff or owner
    if (!isStaff && userId && invoice.client_id !== userId) {
      throw new Error('No tiene permisos para ver esta factura')
    }

    return invoice
  }

  /**
   * Create new invoice with items
   */
  async create(
    tenantId: string,
    userId: string,
    input: CreateInvoiceInput
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
    const invoiceNumber = await this.repository.generateInvoiceNumber(tenantId)

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
    const { data: invoice, error: invoiceError } = await this.repository.create(
      {
        pet_id: pet_id,
        items: processedItems,
        tax_rate: tax_rate,
        notes: notes,
        due_date: due_date,
        idempotency_key: idempotency_key,
      },
      userId,
      tenantId
    )

    if (invoiceError) {
      throw new Error(`Error al crear factura: ${invoiceError.message}`)
    }

    logAudit({
      event: 'invoice_created',
      data: {
        invoice_id: invoice.id,
        tenant_id: tenantId,
        user_id: userId,
      },
    })

    return invoice
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
    const { data: invoice, error: invoiceError } = await this.repository.update(
      id,
      {
        status: status,
        notes: notes,
        internal_notes: internal_notes,
      },
      userId,
      tenantId
    )

    if (invoiceError) {
      throw new Error(`Error al actualizar factura: ${invoiceError.message}`)
    }

    logAudit({
      event: 'invoice_updated',
      data: {
        invoice_id: invoice.id,
        tenant_id: tenantId,
        user_id: userId,
      },
    })

    return invoice
  }
}