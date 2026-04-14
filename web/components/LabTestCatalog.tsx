import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LabTest } from '../types';

const LabTestCatalog = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabTests = async () => {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('id, name, category, price, turnaround_time, description');

      if (error) {
        console.error(error);
      } else {
        setLabTests(data);
      }

      setLoading(false);
    };

    fetchLabTests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Lab Test Catalog</h1>
      <ul>
        {labTests.map((test) => (
          <li key={test.id}>
            <h2>{test.name}</h2>
            <p>Category: {test.category}</p>
            <p>Price: {test.price}</p>
            <p>Turnaround Time: {test.turnaround_time}</p>
            <p>Description: {test.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabTestCatalog;