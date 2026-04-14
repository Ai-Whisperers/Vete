import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/router';

interface TigoMoneyPaymentProps {
  amount: number;
  description: string;
}

const TigoMoneyPayment: React.FC<TigoMoneyPaymentProps> = ({ amount, description }) => {
  const [loading, setLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tigo-money/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/payment-success');
      } else {
        alert('Payment failed');
      }
    } catch (error) {
      console.error(error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay with Tigo Money ($${amount})`}
    </button>
  );
};

export default TigoMoneyPayment;