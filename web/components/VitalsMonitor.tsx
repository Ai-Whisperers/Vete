import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Vitals {
  id: number;
  patientId: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  bloodPressure: number;
  createdAt: string;
}

const VitalsMonitor = () => {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [patientId, setPatientId] = useState<number>(0);

  useEffect(() => {
    const fetchVitals = async () => {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patientId', patientId);
      if (data) {
        setVitals(data);
      }
    };
    fetchVitals();
  }, [patientId]);

  const handlePatientChange = (id: number) => {
    setPatientId(id);
  };

  const chartData = vitals.map((vital) => ({
    temperature: vital.temperature,
    heartRate: vital.heartRate,
    respiratoryRate: vital.respiratoryRate,
    bloodPressure: vital.bloodPressure,
    createdAt: vital.createdAt,
  }));

  return (
    <div>
      <h1>Vitals Monitor</h1>
      <select onChange={(e) => handlePatientChange(Number(e.target.value))}>
        <option value="0">Select Patient</option>
        {/* Add patient options here */}
      </select>
      <LineChart width={500} height={300} data={chartData}>
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
        <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" />
        <Line type="monotone" dataKey="respiratoryRate" stroke="#8884d8" />
        <Line type="monotone" dataKey="bloodPressure" stroke="#82ca9d" />
        <XAxis dataKey="createdAt" />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
      </LineChart>
    </div>
  );
};

export default VitalsMonitor;