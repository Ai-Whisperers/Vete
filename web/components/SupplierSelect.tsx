import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  onChange: (supplier: any) => void;
}

const SupplierSelect: React.FC<Props> = ({ onChange }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (data) {
        setSuppliers(data);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSupplierChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = event.target.value;
    const supplier = suppliers.find((supplier) => supplier.id === supplierId);
    setSelectedSupplier(supplier);
    onChange(supplier);
  };

  return (
    <select value={selectedSupplier?.id} onChange={handleSupplierChange}>
      <option value="">Select a supplier</option>
      {suppliers.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
          {supplier.name}
        </option>
      ))}
    </select>
  );
};

export default SupplierSelect;