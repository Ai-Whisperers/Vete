import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name');

      if (error) {
        console.error(error);
      } else {
        setRooms(data);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomChange = (event) => {
    const roomId = event.target.value;
    const selectedRoom = rooms.find((room) => room.id === roomId);
    setSelectedRoom(selectedRoom);
  };

  return (
    <div>
      <label>Allocate Room:</label>
      <select value={selectedRoom?.id} onChange={handleRoomChange}>
        <option value="">Select a Room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      {selectedRoom && <p>Selected Room: {selectedRoom.name}</p>}
    </div>
  );
};

export default RoomAllocation;