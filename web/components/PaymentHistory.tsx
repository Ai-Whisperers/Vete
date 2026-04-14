import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Payment } from '../types';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setPayments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div>
      <h1>Payment History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.created_at}</td>
                <td>{payment.amount}</td>
                <td>{payment.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentHistory;