import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Prescription } from '../types';
import PrescriptionRefillRequest from './prescription-refill-request';

interface PrescriptionsProps {
  prescriptions: Prescription[];
}

const Prescriptions: React.FC<PrescriptionsProps> = ({ prescriptions }) => {
  const supabaseClient = useSupabaseClient();
  const [prescriptionsData, setPrescriptionsData] = useState(prescriptions);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const { data, error } = await supabaseClient
        .from('prescriptions')
        .select('*');

      if (error) {
        console.error(error);
      } else {
        setPrescriptionsData(data);
      }
    };

    fetchPrescriptions();
  }, [supabaseClient]);

  return (
    <div>
      {prescriptionsData.map((prescription) => (
        <div key={prescription.id}>
          <h2>{prescription.name}</h2>
          <p>{prescription.description}</p>
          <PrescriptionRefillRequest prescription={prescription} />
        </div>
      ))}
    </div>
  );
};

export default Prescriptions;