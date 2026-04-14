import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const EquipmentNeeds = () => {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name');

      if (error) {
        console.error(error);
      } else {
        setEquipment(data);
      }
    };

    fetchEquipment();
  }, []);

  const handleEquipmentChange = (event) => {
    const equipmentId = event.target.value;
    const selectedEquipmentItem = equipment.find((item) => item.id === equipmentId);
    const newSelectedEquipment = [...selectedEquipment];
    if (newSelectedEquipment.includes(selectedEquipmentItem)) {
      newSelectedEquipment.splice(newSelectedEquipment.indexOf(selectedEquipmentItem), 1);
    } else {
      newSelectedEquipment.push(selectedEquipmentItem);
    }
    setSelectedEquipment(newSelectedEquipment);
  };

  return (
    <div>
      <label>Equipment Needs:</label>
      {equipment.map((item) => (
        <div key={item.id}>
          <input
            type="checkbox"
            value={item.id}
            checked={selectedEquipment.includes(item)}
            onChange={handleEquipmentChange}
          />
          <span>{item.name}</span>
        </div>
      ))}
      {selectedEquipment.length > 0 && (
        <p>Selected Equipment: {selectedEquipment.map((item) => item.name).join(', ')}</p>
      )}
    </div>
  );
};

export default EquipmentNeeds;