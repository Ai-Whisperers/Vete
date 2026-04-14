import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PetGrowthData {
  id: number;
  weight: number;
  height: number;
  date: string;
}

interface BreedStandard {
  breed: string;
  weight: number;
  height: number;
}

const PetGrowthChart = () => {
  const [petGrowthData, setPetGrowthData] = useState<PetGrowthData[]>([]);
  const [breedStandards, setBreedStandards] = useState<BreedStandard[]>([]);

  useEffect(() => {
    const fetchPetGrowthData = async () => {
      const { data, error } = await supabase
        .from('pet_growth_data')
        .select('id, weight, height, date');
      if (data) {
        setPetGrowthData(data);
      } else {
        console.error(error);
      }
    };

    const fetchBreedStandards = async () => {
      const { data, error } = await supabase
        .from('breed_standards')
        .select('breed, weight, height');
      if (data) {
        setBreedStandards(data);
      } else {
        console.error(error);
      }
    };

    fetchPetGrowthData();
    fetchBreedStandards();
  }, []);

  const handleExport = () => {
    // Implement export capability
  };

  return (
    <div>
      <LineChart width={500} height={300} data={petGrowthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis dataKey="weight" />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#8884d8" />
        {breedStandards.map((breedStandard) => (
          <Line
            key={breedStandard.breed}
            type="monotone"
            dataKey={breedStandard.weight}
            stroke="#82ca9d"
          />
        ))}
      </LineChart>
      <button onClick={handleExport}>Export</button>
    </div>
  );
};

export default PetGrowthChart;