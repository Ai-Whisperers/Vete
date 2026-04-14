import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const SurgeonAssignment = () => {
  const [surgeons, setSurgeons] = useState([]);
  const [selectedSurgeon, setSelectedSurgeon] = useState(null);

  useEffect(() => {
    const fetchSurgeons = async () => {
      const { data, error } = await supabase
        .from('surgeons')
        .select('id, name');

      if (error) {
        console.error(error);
      } else {
        setSurgeons(data);
      }
    };

    fetchSurgeons();
  }, []);

  const handleSurgeonChange = (event) => {
    const surgeonId = event.target.value;
    const selectedSurgeon = surgeons.find((surgeon) => surgeon.id === surgeonId);
    setSelectedSurgeon(selectedSurgeon);
  };

  return (
    <div>
      <label>Assign Surgeon:</label>
      <select value={selectedSurgeon?.id} onChange={handleSurgeonChange}>
        <option value="">Select a Surgeon</option>
        {surgeons.map((surgeon) => (
          <option key={surgeon.id} value={surgeon.id}>
            {surgeon.name}
          </option>
        ))}
      </select>
      {selectedSurgeon && <p>Selected Surgeon: {selectedSurgeon.name}</p>}
    </div>
  );
};

export default SurgeonAssignment;