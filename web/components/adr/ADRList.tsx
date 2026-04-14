import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ADR {
  id: number;
  title: string;
  description: string;
  decision: string;
}

const ADRList = () => {
  const [adrs, setAdrs] = useState<ADR[]>([]);

  useEffect(() => {
    const fetchAdrs = async () => {
      const { data, error } = await supabase
        .from('adrs')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setAdrs(data);
      }
    };
    fetchAdrs();
  }, []);

  return (
    <div>
      <h1>Architecture Decision Records</h1>
      <ul>
        {adrs.map((adr) => (
          <li key={adr.id}>
            <h2>{adr.title}</h2>
            <p>{adr.description}</p>
            <p>Decision: {adr.decision}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ADRList;