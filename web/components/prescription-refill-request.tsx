import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Prescription } from '../types';

interface PrescriptionRefillRequestProps {
  prescription: Prescription;
}

const PrescriptionRefillRequest: React.FC<PrescriptionRefillRequestProps> = ({ prescription }) => {
  const supabaseClient = useSupabaseClient();
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState(null);

  const handleRefillRequest = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('prescription_refill_requests')
        .insert([{ prescription_id: prescription.id }]);

      if (error) {
        setError(error);
      } else {
        setRequestSent(true);
      }
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      {requestSent ? (
        <p>Refill request sent successfully!</p>
      ) : (
        <button onClick={handleRefillRequest}>Request Refill</button>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
};

export default PrescriptionRefillRequest;