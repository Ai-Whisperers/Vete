import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pet } from '../types/Pet';

interface HealthTimelineProps {
  petId: number;
}

const HealthTimeline: React.FC<HealthTimelineProps> = ({ petId }) => {
  const [healthEvents, setHealthEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHealthEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('health_events')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setHealthEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealthEvents();
  }, [petId]);

  return (
    <div>
      <h2>Health Timeline</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {healthEvents.map((event) => (
            <li key={event.id}>
              <p>
                {event.event_type} on {event.created_at}
              </p>
              <p>{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HealthTimeline;