import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Patient } from '../types/Patient';

interface PatientListProps {
  patients: Patient[];
  onDelete: (patientId: number) => void;
  onEdit: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (patientId: number) => {
    try {
      await supabase.from('patients').delete({ id: patientId });
      onDelete(patientId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (patient: Patient) => {
    onEdit(patient);
  };

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search patients"
      />
      <ul>
        {patients
          .filter((patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((patient) => (
            <li key={patient.id}>
              {patient.name} ({patient.species})
              <button onClick={() => handleEdit(patient)}>Edit</button>
              <button onClick={() => handleDelete(patient.id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default PatientList;