import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import SurgeryCalendar from '../../components/surgery/SurgeryCalendar';
import SurgeonAssignment from '../../components/surgery/SurgeonAssignment';
import RoomAllocation from '../../components/surgery/RoomAllocation';
import EquipmentNeeds from '../../components/surgery/EquipmentNeeds';

const SurgerySchedule = () => {
  const [surgery, setSurgery] = useState({
    id: null,
    start_time: null,
    end_time: null,
    surgeon: null,
    room: null,
    equipment: [],
  });

  const handleSurgeryChange = (event) => {
    const { name, value } = event.target;
    setSurgery({ ...surgery, [name]: value });
  };

  const handleSurgerySubmit = async (event) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from('surgeries')
        .insert([surgery]);

      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Surgery Schedule</h1>
      <SurgeryCalendar />
      <form onSubmit={handleSurgerySubmit}>
        <SurgeonAssignment />
        <RoomAllocation />
        <EquipmentNeeds />
        <button type="submit">Schedule Surgery</button>
      </form>
    </div>
  );
};

export default SurgerySchedule;