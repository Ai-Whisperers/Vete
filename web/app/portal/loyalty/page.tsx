import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { LoyaltyService } from '@/lib/domain/loyalty/service';
import { LoyaltyPoints, LoyaltyTransaction, LoyaltyReward } from '@/lib/domain/loyalty/types';

export default function LoyaltyPage() {
  const supabase = useSupabaseClient();
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [availableRewards, setAvailableRewards] = useState<LoyaltyReward[]>([]);

  const loyaltyService = new LoyaltyService(supabase);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      const clientId = 'client-id';
      const tenantId = 'tenant-id';

      const points = await loyaltyService.getLoyaltyPoints(clientId, tenantId);
      const transactions = await loyaltyService.getLoyaltyTransactions(clientId, tenantId);
      const rewards = await loyaltyService.getAvailableRewards(tenantId);

      setLoyaltyPoints(points);
      setLoyaltyTransactions(transactions);
      setAvailableRewards(rewards);
    };

    fetchLoyaltyData();
  }, [loyaltyService]);

  return (
    <div>
      <h1>Loyalty Points: {loyaltyPoints?.balance}</h1>
      <h2>Transactions:</h2>
      <ul>
        {loyaltyTransactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} ({transaction.points})
          </li>
        ))}
      </ul>
      <h2>Available Rewards:</h2>
      <ul>
        {availableRewards.map((reward) => (
          <li key={reward.id}>
            {reward.name} ({reward.pointsRequired})
          </li>
        ))}
      </ul>
    </div>
  );
}