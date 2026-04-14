import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

interface Claim {
  id: number;
  clientId: number;
  petId: number;
  claimDate: Date;
  claimAmount: number;
  status: string;
}

const ClaimForm = () => {
  const [clientId, setClientId] = useState<number>(0);
  const [petId, setPetId] = useState<number>(0);
  const [claimDate, setClaimDate] = useState<Date>(new Date());
  const [claimAmount, setClaimAmount] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [document, setDocument] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from('claims')
        .insert([
          {
            client_id: clientId,
            pet_id: petId,
            claim_date: claimDate,
            claim_amount: claimAmount,
            status: 'pending',
          },
        ]);
      if (error) {
        console.error(error);
      } else {
        const claimId = data[0].id;
        if (document) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('claims')
            .upload(`${claimId}.pdf`, document, {
              upsert: true,
            });
          if (uploadError) {
            console.error(uploadError);
          }
        }
        router.push('/claims');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Client ID:
        <input type="number" value={clientId} onChange={(event) => setClientId(Number(event.target.value))} />
      </label>
      <label>
        Pet ID:
        <input type="number" value={petId} onChange={(event) => setPetId(Number(event.target.value))} />
      </label>
      <label>
        Claim Date:
        <input type="date" value={claimDate.toISOString().split('T')[0]} onChange={(event) => setClaimDate(new Date(event.target.value))} />
      </label>
      <label>
        Claim Amount:
        <input type="number" value={claimAmount} onChange={(event) => setClaimAmount(Number(event.target.value))} />
      </label>
      <label>
        Document:
        <input type="file" onChange={(event) => setDocument(event.target.files[0])} />
      </label>
      <button type="submit">Submit Claim</button>
    </form>
  );
};

export default ClaimForm;