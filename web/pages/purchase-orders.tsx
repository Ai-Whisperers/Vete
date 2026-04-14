import { useState } from 'react';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const handleSubmit = async (purchaseOrder: any) => {
    const { data, error } = await supabase.from('purchase_orders').insert([purchaseOrder]);
    if (data) {
      setPurchaseOrders([...purchaseOrders, data[0]]);
    }
  };

  return (
    <div>
      <h1>Purchase Orders</h1>
      <PurchaseOrderForm onSubmit={handleSubmit} />
      <ul>
        {purchaseOrders.map((purchaseOrder) => (
          <li key={purchaseOrder.id}>
            <p>Supplier: {purchaseOrder.supplier.name}</p>
            <p>Items:</p>
            <ul>
              {purchaseOrder.items.map((item) => (
                <li key={item.name}>
                  <p>{item.name} x {item.quantity}</p>
                </li>
              ))}
            </ul>
            <p>Total: {purchaseOrder.total}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PurchaseOrders;