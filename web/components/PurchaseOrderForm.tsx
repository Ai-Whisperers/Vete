import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Supplier, PurchaseOrder } from '../types';

interface Props {
  onSubmit: (purchaseOrder: PurchaseOrder) => void;
}

const PurchaseOrderForm: React.FC<Props> = ({ onSubmit }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<{ name: string; quantity: number }[]>([]);
  const [total, setTotal] = useState(0);

  const handleSupplierChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = event.target.value;
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', supplierId);
    if (data) {
      setSupplier(data[0]);
    }
  };

  const handleItemAdd = () => {
    setItems([...items, { name: '', quantity: 0 }]);
  };

  const handleItemChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const updatedItems = [...items];
    updatedItems[index][name] = value;
    setItems(updatedItems);
  };

  const handleItemRemove = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const purchaseOrder: PurchaseOrder = {
      supplierId: supplier?.id,
      items: items.map((item) => ({ name: item.name, quantity: parseInt(item.quantity, 10) })),
      total: total,
    };
    onSubmit(purchaseOrder);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Supplier:
        <select value={supplier?.id} onChange={handleSupplierChange}>
          <option value="">Select a supplier</option>
          {supabase.from('suppliers').select('*').then((data) => data.data).map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Items:
        {items.map((item, index) => (
          <div key={index}>
            <input type="text" name="name" value={item.name} onChange={(event) => handleItemChange(index, event)} />
            <input type="number" name="quantity" value={item.quantity} onChange={(event) => handleItemChange(index, event)} />
            <button type="button" onClick={() => handleItemRemove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleItemAdd}>
          Add item
        </button>
      </label>
      <label>
        Total:
        <input type="number" value={total} onChange={(event) => setTotal(parseInt(event.target.value, 10))} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PurchaseOrderForm;