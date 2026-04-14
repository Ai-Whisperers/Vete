import React from 'react';
import KennelBoard from '../components/KennelBoard';
import { supabase } from '../lib/supabase';
import { Kennel, Patient } from '../types';

const KennelBoardPage = () => {
  const [kennels, setKennels] = React.useState<Kennel[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  React.useEffect(() => {
    const fetchKennels = async () => {
      const { data, error } = await supabase.from('kennels').select('id, name');
      if (error) {
        console.error(error);
      } else {
        setKennels(data);
      }
    };

    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('id, name');
      if (error) {
        console.error(error);
      } else {
        setPatients(data);
      }
    };

    fetchKennels();
    fetchPatients();
  }, []);

  return (
    <div>
      <KennelBoard kennels={kennels} patients={patients} />
    </div>
  );
};

export default KennelBoardPage;