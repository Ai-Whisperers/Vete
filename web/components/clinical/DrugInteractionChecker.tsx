'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { Drug } from '@/types';

interface DrugInteractionCheckerProps {
  selectedDrugs: Drug[];
}

const DrugInteractionChecker: React.FC<DrugInteractionCheckerProps> = ({
  selectedDrugs,
}) => {
  const [interactions, setInteractions] = useState([]);
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery(
    queryKeys.drugInteractions,
    async () => {
      const response = await fetch('/api/drug-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedDrugs),
      });
      return response.json();
    },
    {
      enabled: selectedDrugs.length > 0,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (data) {
    setInteractions(data);
  }

  return (
    <div>
      <h2>Drug Interactions</h2>
      <ul>
        {interactions.map((interaction) => (
          <li key={interaction.id}>
            {interaction.drug1.name} and {interaction.drug2.name} may interact
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DrugInteractionChecker;