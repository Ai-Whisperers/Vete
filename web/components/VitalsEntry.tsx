import { useState } from 'react';
import { supabase } from '../lib/supabase';

const VitalsEntry = () => {
  const [temperature, setTemperature] = useState<number>(0);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(0);
  const [bloodPressure, setBloodPressure] = useState<number>(0);
  const [patientId, setPatientId] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.from('vitals').insert([
      {
        patientId,
        temperature,
        heartRate,
        respiratoryRate,
        bloodPressure,
      },
    ]);
    if (data) {
      console.log('Vitals entry created successfully');
    } else {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Temperature:
        <input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
      </label>
      <label>
        Heart Rate:
        <input type="number" value={heartRate} onChange={(e) => setHeartRate(Number(e.target.value))} />
      </label>
      <label>
        Respiratory Rate:
        <input type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(Number(e.target.value))} />
      </label>
      <label>
        Blood Pressure:
        <input type="number" value={bloodPressure} onChange={(e) => setBloodPressure(Number(e.target.value))} />
      </label>
      <label>
        Patient ID:
        <input type="number" value={patientId} onChange={(e) => setPatientId(Number(e.target.value))} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default VitalsEntry;