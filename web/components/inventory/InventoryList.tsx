import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const supabase = useSupabase();

  useEffect(() => {
    const fetchInventory = async () => {
      const service = new InventoryService(supabase);
      const data = await service.list();
      setInventory(data);
    };

    fetchInventory();
  }, [supabase]);

  return (
    <div>
      <h1>Inventory List</h1>
      <ul>
        {inventory.map((item) => (
          <li key={item.id}>
            <span>{item.product.name}</span>
            <span>{item.stock_quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;

This implementation provides a basic structure for inventory management, including domain layer, server actions, and components. You can extend and modify this code to fit your specific requirements.