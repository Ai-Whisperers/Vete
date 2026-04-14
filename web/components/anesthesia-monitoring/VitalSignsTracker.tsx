import { useState } from 'react';

const VitalSignsTracker = () => {
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: 0,
    bloodPressure: 0,
    oxygenLevel: 0,
  });

  const handleUpdateVitalSigns = (newVitalSigns: any) => {
    setVitalSigns(newVitalSigns);
  };

  return (
    <div>
      <h2>Vital Signs Tracker</h2>
      <p>Heart Rate: {vitalSigns.heartRate}</p>
      <p>Blood Pressure: {vitalSigns.bloodPressure}</p>
      <p>Oxygen Level: {vitalSigns.oxygenLevel}</p>
      <button onClick={() => handleUpdateVitalSigns({ heartRate: 100, bloodPressure: 120, oxygenLevel: 95 })}>
        Update Vital Signs
      </button>
    </div>
  );
};

export default VitalSignsTracker;