import { useState } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { Medication, Prescription } from '@/types';

interface MedicationDispensingWorkflowProps {
  prescriptionId: number;
}

const MedicationDispensingWorkflow: React.FC<MedicationDispensingWorkflowProps> = ({ prescriptionId }) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [inventory, setInventory] = useState<number>(0);

  const handleLookupPrescription = async () => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId);
    if (error) {
      console.error(error);
    } else {
      setPrescription(data[0]);
    }
  };

  const handleCheckInventory = async () => {
    const { data, error } = await supabase
      .from('medications')
      .select('quantity')
      .eq('id', medication?.id);
    if (error) {
      console.error(error);
    } else {
      setInventory(data[0].quantity);
    }
  };

  const handleDispenseMedication = async () => {
    const { data, error } = await supabase
      .from('dispensations')
      .insert([{ prescription_id: prescriptionId, medication_id: medication?.id, quantity: 1 }]);
    if (error) {
      console.error(error);
    } else {
      router.push('/dispensations');
    }
  };

  const handlePrintLabel = async () => {
    // Implement label printing logic here
  };

  return (
    <div>
      <h1>Medication Dispensing Workflow</h1>
      <button onClick={handleLookupPrescription}>Lookup Prescription</button>
      <button onClick={handleCheckInventory}>Check Inventory</button>
      <button onClick={handleDispenseMedication}>Dispense Medication</button>
      <button onClick={handlePrintLabel}>Print Label</button>
      {medication && <p>Medication: {medication.name}</p>}
      {prescription && <p>Prescription: {prescription.patient_name}</p>}
      {inventory > 0 && <p>Inventory: {inventory}</p>}
    </div>
  );
};

export default MedicationDispensingWorkflow;