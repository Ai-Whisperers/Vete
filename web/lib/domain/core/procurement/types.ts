import { z } from 'zod'

export const PurchaseOrderStatus = z.enum(['draft', 'submitted', 'approved', 'shipped', 'received'])
export type PurchaseOrderStatus = z.infer<typeof PurchaseOrderStatus>

export const PurchaseOrderItemStatus = z.enum(['pending', 'received', 'rejected'])
export type PurchaseOrderItemStatus = z.infer<typeof PurchaseOrderItemStatus>

export const SupplierType = z.enum(['local', 'international'])
export type SupplierType = z.infer<typeof SupplierType>

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id: string
  order_number: string
  status: PurchaseOrderStatus
  total: number
  created_at: Date
  updated_at: Date
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  quantity: number
  unit_cost: number
  total_cost: number
  status: PurchaseOrderItemStatus
  received_quantity: number
  rejected_quantity: number
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  type: SupplierType
  contact_name: string
  contact_email: string
  contact_phone: string
}

export interface CreatePurchaseOrderData {
  supplier_id: string
  items: Array<{
    product_id: string
    quantity: number
    unit_cost: number
  }>
}

export interface UpdatePurchaseOrderStatus {
  status: PurchaseOrderStatus
}

export interface ReceivePurchaseOrderItem {
  purchase_order_item_id: string
  received_quantity: number
}