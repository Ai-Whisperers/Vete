import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Supplier } from '../types/Supplier';

const SupplierDirectory = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_information, product_catalog, performance_ratings');
    if (error) {
      console.error(error);
    } else {
      setSuppliers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (supplier: Supplier) => {
    const { data, error } = await supabase.from('suppliers').insert([supplier]);
    if (error) {
      console.error(error);
    } else {
      setSuppliers([...suppliers, data[0]]);
    }
  };

  const handleUpdateSupplier = async (supplier: Supplier) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ id: supplier.id }, supplier);
    if (error) {
      console.error(error);
    } else {
      setSuppliers(suppliers.map((s) => (s.id === supplier.id ? supplier : s)));
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    const { error } = await supabase.from('suppliers').delete({ id });
    if (error) {
      console.error(error);
    } else {
      setSuppliers(suppliers.filter((s) => s.id !== id));
    }
  };

  return (
    <div>
      <h1>Supplier Directory</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Information</th>
              <th>Product Catalog</th>
              <th>Performance Ratings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.contact_information}</td>
                <td>{supplier.product_catalog}</td>
                <td>{supplier.performance_ratings}</td>
                <td>
                  <button onClick={() => handleUpdateSupplier(supplier)}>Update</button>
                  <button onClick={() => handleDeleteSupplier(supplier.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => handleCreateSupplier({ name: '', contact_information: '', product_catalog: '', performance_ratings: '' })}>
        Create Supplier
      </button>
    </div>
  );
};

export default SupplierDirectory;