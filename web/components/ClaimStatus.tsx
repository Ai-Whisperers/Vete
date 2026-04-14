import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Claim {
  id: number;
  clientId: number;
  petId: number;
  claimDate: Date;
  claimAmount: number;
  status: string;
}

const ClaimStatus = ({ claimId }: { claimId: number }) => {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('status')
        .eq('id', claimId);
      if (error) {
        console.error(error);
      } else {
        setStatus(data[0].status);
      }
    };
    fetchStatus();
  }, [claimId]);

  return <p>Claim Status: {status}</p>;
};

export default ClaimStatus;