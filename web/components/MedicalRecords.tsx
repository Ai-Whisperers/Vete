import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MedicalRecord } from '../types/MedicalRecord';

const MedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filter, setFilter] = useState({ date: '', type: '' });

  const fetchMedicalRecords = async () => {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setMedicalRecords(data);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const filteredMedicalRecords = medicalRecords.filter((record) => {
    const dateMatch = filter.date ? record.created_at.includes(filter.date) : true;
    const typeMatch = filter.type ? record.type.includes(filter.type) : true;
    return dateMatch && typeMatch;
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  return (
    <div>
      <h1>Medical Records</h1>
      <form>
        <label>
          Date:
          <input type="date" name="date" value={filter.date} onChange={handleFilterChange} />
        </label>
        <label>
          Type:
          <input type="text" name="type" value={filter.type} onChange={handleFilterChange} />
        </label>
      </form>
      <ul>
        {filteredMedicalRecords.map((record) => (
          <li key={record.id}>
            <h2>{record.pet_name}</h2>
            <p>Date: {record.created_at}</p>
            <p>Type: {record.type}</p>
            <p>Notes: {record.notes}</p>
            <button>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicalRecords;