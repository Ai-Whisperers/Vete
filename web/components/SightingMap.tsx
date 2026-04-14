import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useSession } from '../hooks/useSession';
import { getSightings } from '../lib/api';

interface Sighting {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const SightingMap = () => {
  const supabaseClient = useSupabaseClient();
  const session = useSession();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<Sighting[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<Date | null>(null);

  useEffect(() => {
    const fetchSightings = async () => {
      const data = await getSightings(supabaseClient, session);
      setSightings(data);
    };
    fetchSightings();
  }, [supabaseClient, session]);

  useEffect(() => {
    if (timelineFilter) {
      const filtered = sightings.filter((sighting) => sighting.timestamp >= timelineFilter);
      setFilteredSightings(filtered);
    } else {
      setFilteredSightings(sightings);
    }
  }, [sightings, timelineFilter]);

  const handleTimelineFilterChange = (date: Date | null) => {
    setTimelineFilter(date);
  };

  return (
    <div>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {filteredSightings.map((sighting) => (
          <Marker key={sighting.id} position={[sighting.latitude, sighting.longitude]}>
            <Popup>
              <div>
                <h2>Sighting {sighting.id}</h2>
                <p>Timestamp: {sighting.timestamp.toISOString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div>
        <input
          type='date'
          value={timelineFilter ? timelineFilter.toISOString().split('T')[0] : ''}
          onChange={(e) => handleTimelineFilterChange(e.target.value ? new Date(e.target.value) : null)}
        />
      </div>
    </div>
  );
};

export default SightingMap;