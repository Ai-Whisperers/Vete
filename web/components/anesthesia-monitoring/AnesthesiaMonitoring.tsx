import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnesthesiaRecord } from '@/types/anesthesia';

const AnesthesiaMonitoring = () => {
  const [anesthesiaRecords, setAnesthesiaRecords] = useState<AnesthesiaRecord[]>([]);
  const { data, error, isLoading } = useQuery(
    ['anesthesiaRecords'],
    async () => {
      const { data, error } = await supabase
        .from('anesthesia_records')
        .select('*');
      if (error) {
        throw error;
      }
      return data;
    }
  );

  const { mutate, isLoading: isMutating } = useMutation(
    async (newRecord: AnesthesiaRecord) => {
      const { data, error } = await supabase
        .from('anesthesia_records')
        .insert([newRecord]);
      if (error) {
        throw error;
      }
      return data;
    }
  );

  useEffect(() => {
    if (data) {
      setAnesthesiaRecords(data);
    }
  }, [data]);

  const handleAddRecord = (newRecord: AnesthesiaRecord) => {
    mutate(newRecord);
  };

  return (
    <div>
      <h1>Anesthesia Monitoring</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {anesthesiaRecords.map((record) => (
            <li key={record.id}>
              <p>Patient: {record.patient_name}</p>
              <p>Procedure: {record.procedure_name}</p>
              <p>Vital Signs: {record.vital_signs}</p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => handleAddRecord({ patient_name: 'John Doe', procedure_name: 'Surgery', vital_signs: 'Normal' })}>
        Add Record
      </button>
    </div>
  );
};

export default AnesthesiaMonitoring;