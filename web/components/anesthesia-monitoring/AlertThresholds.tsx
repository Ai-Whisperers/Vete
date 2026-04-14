import { useState } from 'react';

const AlertThresholds = () => {
  const [thresholds, setThresholds] = useState({
    heartRate: 100,
    bloodPressure: 120,
    oxygenLevel: 95,
  });

  const handleUpdateThresholds = (newThresholds: any) => {
    setThresholds(newThresholds);
  };

  return (
    <div>
      <h2>Alert Thresholds</h2>
      <p>Heart Rate: {thresholds.heartRate}</p>
      <p>Blood Pressure: {thresholds.bloodPressure}</p>
      <p>Oxygen Level: {thresholds.oxygenLevel}</p>
      <button onClick={() => handleUpdateThresholds({ heartRate: 110, bloodPressure: 130, oxygenLevel: 90 })}>
        Update Thresholds
      </button>
    </div>
  );
};

export default AlertThresholds;