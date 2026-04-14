import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types/inventory';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<InventoryItem[]>([]);
  const [barcode, setBarcode] = useState<string>('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      setInventory(data);
      setLowStockAlerts(data.filter((item) => item.quantity < 5));
    }
  };

  const handleStockAdjustment = async (item: InventoryItem, quantity: number) => {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        id: item.id,
        quantity: item.quantity + quantity,
      });
    if (error) {
      console.error(error);
    } else {
      fetchInventory();
    }
  };

  const handleBarcodeScan = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('barcode', barcode);
    if (error) {
      console.error(error);
    } else {
      if (data.length > 0) {
        const item = data[0];
        handleStockAdjustment(item, 1);
      }
    }
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Barcode</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>{item.barcode}</td>
              <td>
                <button onClick={() => handleStockAdjustment(item, 1)}>+</button>
                <button onClick={() => handleStockAdjustment(item, -1)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Low Stock Alerts</h2>
      <ul>
        {lowStockAlerts.map((item) => (
          <li key={item.id}>{item.product} ({item.quantity})</li>
        ))}
      </ul>
      <input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Scan barcode"
      />
      <button onClick={handleBarcodeScan}>Scan</button>
    </div>
  );
};

export default InventoryManagement;