import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Prescription } from '../types';
import Prescriptions from '../components/prescriptions';

interface PrescriptionsPageProps {}

const PrescriptionsPage: React.FC<PrescriptionsPageProps> = () => {
  const supabaseClient = useSupabaseClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const { data, error } = await supabaseClient
        .from('prescriptions')
        .select('*');

      if (error) {
        console.error(error);
      } else {
        setPrescriptions(data);
      }
    };

    fetchPrescriptions();
  }, [supabaseClient]);

  return (
    <div>
      <h1>Prescriptions</h1>
      <Prescriptions prescriptions={prescriptions} />
    </div>
  );
};

export default PrescriptionsPage;