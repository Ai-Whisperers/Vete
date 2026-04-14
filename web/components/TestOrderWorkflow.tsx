import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Patient, Test } from '../types';

const TestOrderWorkflow = () => {
  const supabaseClient = useSupabaseClient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const [sampleCollection, setSampleCollection] = useState<string>('');

  const handlePatientSelection = async (patientId: number) => {
    const { data, error } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('id', patientId);
    if (data) {
      setPatient(data[0]);
    } else {
      console.error(error);
    }
  };

  const handleTestSelection = async () => {
    const { data, error } = await supabaseClient
      .from('tests')
      .select('*');
    if (data) {
      setTests(data);
    } else {
      console.error(error);
    }
  };

  const handleTestChange = (test: Test) => {
    const isSelected = selectedTests.includes(test);
    if (isSelected) {
      setSelectedTests(selectedTests.filter((t) => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleSampleCollectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSampleCollection(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([
          {
            patient_id: patient?.id,
            tests: selectedTests.map((test) => test.id),
            sample_collection: sampleCollection,
          },
        ]);
      if (data) {
        console.log('Order submitted successfully');
      } else {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Test Order Workflow</h1>
      <div>
        <label>Patient:</label>
        <select
          value={patient?.id}
          onChange={(event) => handlePatientSelection(parseInt(event.target.value))}
        >
          <option value="">Select a patient</option>
          {/* Patient options will be populated here */}
        </select>
      </div>
      <div>
        <label>Tests:</label>
        <ul>
          {tests.map((test) => (
            <li key={test.id}>
              <input
                type="checkbox"
                checked={selectedTests.includes(test)}
                onChange={() => handleTestChange(test)}
              />
              <span>{test.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label>Sample Collection:</label>
        <select value={sampleCollection} onChange={handleSampleCollectionChange}>
          <option value="">Select a sample collection method</option>
          <option value="blood">Blood</option>
          <option value="urine">Urine</option>
          {/* More options will be added here */}
        </select>
      </div>
      <button onClick={handleSubmit}>Submit Order</button>
    </div>
  );
};

export default TestOrderWorkflow;