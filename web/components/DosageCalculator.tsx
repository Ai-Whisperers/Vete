import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Drug, Species } from '../types';

interface DosageCalculatorProps {
  petId: number;
}

const DosageCalculator: React.FC<DosageCalculatorProps> = ({ petId }) => {
  const [species, setSpecies] = useState<Species | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [drug, setDrug] = useState<Drug | null>(null);
  const [dosage, setDosage] = useState<number | null>(null);

  const handleSpeciesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecies(event.target.value as Species);
  };

  const handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(Number(event.target.value));
  };

  const handleDrugChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDrug(event.target.value as Drug);
  };

  const calculateDosage = async () => {
    if (!species || !weight || !drug) return;

    const { data, error } = await supabase
      .from('drug_dosages')
      .select('dosage')
      .eq('species', species)
      .eq('weight', weight)
      .eq('drug', drug);

    if (error) {
      console.error(error);
      return;
    }

    setDosage(data[0].dosage);
  };

  const saveToRecord = async () => {
    if (!petId || !dosage) return;

    const { data, error } = await supabase
      .from('pet_records')
      .insert([{ pet_id: petId, dosage }]);

    if (error) {
      console.error(error);
      return;
    }

    console.log('Dosage saved to record');
  };

  return (
    <div>
      <h2>Dosage Calculator</h2>
      <form>
        <label>
          Species:
          <select value={species} onChange={handleSpeciesChange}>
            <option value="">Select species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
        </label>
        <br />
        <label>
          Weight (kg):
          <input type="number" value={weight} onChange={handleWeightChange} />
        </label>
        <br />
        <label>
          Drug:
          <select value={drug} onChange={handleDrugChange}>
            <option value="">Select drug</option>
            <option value="paracetamol">Paracetamol</option>
            <option value="ibuprofen">Ibuprofen</option>
          </select>
        </label>
        <br />
        <button type="button" onClick={calculateDosage}>
          Calculate Dosage
        </button>
        <br />
        <p>Dosage: {dosage}</p>
        <button type="button" onClick={saveToRecord}>
          Save to Record
        </button>
      </form>
    </div>
  );
};

export default DosageCalculator;