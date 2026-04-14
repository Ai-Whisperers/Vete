import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PatientForm from '../components/PatientForm';
import PatientList from '../components/PatientList';

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*');
      if (error) {
        console.error(error);
      } else {
        setPatients(data);
      }
    };
    fetchPatients();
  }, []);

  const handleCreatePatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const handleUpdatePatient = (patient: Patient) => {
    setPatients(
      patients.map((existingPatient) =>
        existingPatient.id === patient.id ? patient : existingPatient
      )
    );
  };

  const handleDeletePatient = (patientId: number) => {
    setPatients(patients.filter((patient) => patient.id !== patientId));
  };

  return (
    <div>
      <h1>Patients</h1>
      <PatientForm
        patient={selectedPatient}
        onSubmit={(patient) => {
          if (selectedPatient) {
            handleUpdatePatient(patient);
          } else {
            handleCreatePatient(patient);
          }
        }}
      />
      <PatientList
        patients={patients}
        onDelete={handleDeletePatient}
        onEdit={(patient) => setSelectedPatient(patient)}
      />
    </div>
  );
};

export default PatientsPage;