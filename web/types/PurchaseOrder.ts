interface PurchaseOrder {
  id: number;
  supplierId: number;
  items: { name: string; quantity: number }[];
  total: number;
}

export default PurchaseOrder;