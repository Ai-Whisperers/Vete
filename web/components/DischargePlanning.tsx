import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Patient, DischargePlan } from '../types';

interface DischargePlanningProps {
  patientId: number;
}

const DischargePlanning: React.FC<DischargePlanningProps> = ({ patientId }) => {
  const [dischargePlan, setDischargePlan] = useState<DischargePlan | null>(null);
  const [medications, setMedications] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [instructions, setInstructions] = useState<string>('');

  useEffect(() => {
    const fetchDischargePlan = async () => {
      const { data, error } = await supabase
        .from('discharge_plans')
        .select('*')
        .eq('patient_id', patientId);
      if (data) {
        setDischargePlan(data[0]);
      }
    };
    fetchDischargePlan();
  }, [patientId]);

  const handleMedicationChange = (medication: string) => {
    setMedications((prevMedications) => [...prevMedications, medication]);
  };

  const handleFollowUpDateChange = (date: Date) => {
    setFollowUpDate(date);
  };

  const handleInstructionsChange = (instruction: string) => {
    setInstructions(instruction);
  };

  const generateDischargePlan = async () => {
    const { data, error } = await supabase
      .from('discharge_plans')
      .insert([
        {
          patient_id: patientId,
          medications: medications.join(','),
          follow_up_date: followUpDate,
          instructions: instructions,
        },
      ]);
    if (data) {
      setDischargePlan(data[0]);
    }
  };

  return (
    <div>
      <h2>Discharge Planning</h2>
      <form>
        <label>Medications:</label>
        <input type="text" onChange={(e) => handleMedicationChange(e.target.value)} />
        <br />
        <label>Follow-up Date:</label>
        <input type="date" onChange={(e) => handleFollowUpDateChange(new Date(e.target.value))} />
        <br />
        <label>Instructions:</label>
        <textarea onChange={(e) => handleInstructionsChange(e.target.value)} />
        <br />
        <button type="button" onClick={generateDischargePlan}>
          Generate Discharge Plan
        </button>
      </form>
      {dischargePlan && (
        <div>
          <h3>Discharge Plan</h3>
          <p>Medications: {dischargePlan.medications}</p>
          <p>Follow-up Date: {dischargePlan.follow_up_date}</p>
          <p>Instructions: {dischargePlan.instructions}</p>
        </div>
      )}
    </div>
  );
};

export default DischargePlanning;