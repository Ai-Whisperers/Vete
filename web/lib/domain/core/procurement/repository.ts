import { SupabaseClient } from '@supabase/supabase-js'
import { PurchaseOrder, PurchaseOrderItem, Supplier } from './types'

export class ProcurementRepository {
  constructor(private supabase: SupabaseClient) {}

  async createPurchaseOrder(data: CreatePurchaseOrderData, tenantId: string): Promise<PurchaseOrder> {
    const { data: purchaseOrder, error } = await this.supabase
      .from('purchase_orders')
      .insert({
        tenant_id: tenantId,
        supplier_id: data.supplier_id,
        order_number: `PO-${Date.now()}`,
        status: 'draft',
        total: data.items.reduce((acc, item) => acc + item.quantity * item.unit_cost, 0),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const purchaseOrderId = purchaseOrder.id

    await this.supabase.from('purchase_order_items').insert(
      data.items.map((item) => ({
        purchase_order_id: purchaseOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
        status: 'pending',
      }))
    )

    return purchaseOrder
  }

  async getPurchaseOrder(id: string, tenantId: string): Promise<PurchaseOrder | null> {
    const { data, error } = await this.supabase
      .from('purchase_orders')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }

  async updatePurchaseOrderStatus(id: string, data: UpdatePurchaseOrderStatus, tenantId: string): Promise<PurchaseOrder> {
    const { data: purchaseOrder, error } = await this.supabase
      .from('purchase_orders')
      .update({
        status: data.status,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error || !purchaseOrder) {
      throw error
    }

    return purchaseOrder
  }

  async receivePurchaseOrderItem(data: ReceivePurchaseOrderItem, tenantId: string): Promise<PurchaseOrderItem> {
    const { data: purchaseOrderItem, error } = await this.supabase
      .from('purchase_order_items')
      .update({
        status: 'received',
        received_quantity: data.received_quantity,
      })
      .eq('id', data.purchase_order_item_id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error || !purchaseOrderItem) {
      throw error
    }

    return purchaseOrderItem
  }
}