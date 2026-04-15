import { ProcurementRepository } from './repository'
import { PurchaseOrder, PurchaseOrderItem, CreatePurchaseOrderData, UpdatePurchaseOrderStatus, ReceivePurchaseOrderItem } from './types'

export class ProcurementService {
  private repository: ProcurementRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new ProcurementRepository(supabase)
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData, tenantId: string): Promise<PurchaseOrder> {
    return this.repository.createPurchaseOrder(data, tenantId)
  }

  async getPurchaseOrder(id: string, tenantId: string): Promise<PurchaseOrder | null> {
    return this.repository.getPurchaseOrder(id, tenantId)
  }

  async updatePurchaseOrderStatus(id: string, data: UpdatePurchaseOrderStatus, tenantId: string): Promise<PurchaseOrder> {
    return this.repository.updatePurchaseOrderStatus(id, data, tenantId)
  }

  async receivePurchaseOrderItem(data: ReceivePurchaseOrderItem, tenantId: string): Promise<PurchaseOrderItem> {
    return this.repository.receivePurchaseOrderItem(data, tenantId)
  }
}