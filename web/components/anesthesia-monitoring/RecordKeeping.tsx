import { useState } from 'react';

const RecordKeeping = () => {
  const [records, setRecords] = useState([]);

  const handleAddRecord = (newRecord: any) => {
    setRecords([...records, newRecord]);
  };

  return (
    <div>
      <h2>Record Keeping</h2>
      <ul>
        {records.map((record, index) => (
          <li key={index}>
            <p>Patient: {record.patient_name}</p>
            <p>Procedure: {record.procedure_name}</p>
            <p>Vital Signs: {record.vital_signs}</p>
          </li>
        ))}
      </ul>
      <button onClick={() => handleAddRecord({ patient_name: 'John Doe', procedure_name: 'Surgery', vital_signs: 'Normal' })}>
        Add Record
      </button>
    </div>
  );
};

export default RecordKeeping;