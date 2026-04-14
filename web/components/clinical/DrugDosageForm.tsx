'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { Drug } from '@/types';

interface DrugDosageFormProps {
  drug: Drug;
}

const DrugDosageForm: React.FC<DrugDosageFormProps> = ({ drug }) => {
  const [dosage, setDosage] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation(
    async (dosage: string) => {
      const response = await fetch('/api/drug-dosages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drugId: drug.id, dosage }),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.drugDosages);
      },
    }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(dosage);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Dosage:
        <input type="number" value={dosage} onChange={(event) => setDosage(event.target.value)} />
      </label>
      <button type="submit">Save</button>
      {isLoading ? <div>Loading...</div> : null}
      {error ? <div>Error: {error.message}</div> : null}
    </form>
  );
};

export default DrugDosageForm;