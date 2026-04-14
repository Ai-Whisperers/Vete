import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .gt('temperature', 100)
        .or('heartRate.gt', 100)
        .or('respiratoryRate.gt', 20)
        .or('bloodPressure.gt', 120);
      if (data) {
        setAlerts(data);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div>
      <h1>Alerts</h1>
      {alerts.map((alert) => (
        <div key={alert.id}>
          <p>Patient ID: {alert.patientId}</p>
          <p>Temperature: {alert.temperature}</p>
          <p>Heart Rate: {alert.heartRate}</p>
          <p>Respiratory Rate: {alert.respiratoryRate}</p>
          <p>Blood Pressure: {alert.bloodPressure}</p>
        </div>
      ))}
    </div>
  );
};

export default Alerts;