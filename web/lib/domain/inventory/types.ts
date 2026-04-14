export type TransactionType = 
  | 'purchase'     // Receiving stock from supplier
  | 'sale'         // Selling to customer
  | 'adjustment'   // Manual stock adjustment
  | 'return'       // Customer return
  | 'damage'       // Damaged goods
  | 'theft'        // Theft/loss
  | 'expired'      // Expired products
  | 'transfer'     // Transfer between locations
  | 'reservation'; // Reserved for pending order

export interface Inventory {
  id: string;
  product_id: string;
  tenant_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number; // Computed: stock_quantity - reserved_quantity
  min_stock_level?: number | null;
  reorder_quantity?: number | null;
  reorder_point?: number | null;
  weighted_average_cost?: number | null;
  location?: string | null;
  bin_number?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  supplier_name?: string | null;
  updated_at: string;
  created_at?: string;
}

export interface InventoryTransaction {
  id: string;
  tenant_id: string;
  product_id: string;
  type: TransactionType;
  quantity: number; // Positive for additions, negative for subtractions
  unit_cost?: number | null;
  reference_type?: string | null; // e.g., 'order', 'return', 'adjustment'
  reference_id?: string | null;   // ID of the referenced entity
  notes?: string | null;
  performed_by?: string | null;   // User ID who performed the transaction
  created_at: string;
}

export interface InventoryWithProduct extends Inventory {
  product?: {
    name: string;
    sku?: string;
    category?: string;
    unit?: string;
  };
}