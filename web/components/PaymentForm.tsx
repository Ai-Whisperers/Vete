import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PaymentMethod, Transaction } from '../types';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (transaction: Transaction) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onPaymentSuccess }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const supabaseClient = useSupabaseClient();

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handlePartialAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPartialAmount(Number(event.target.value));
  };

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMethod) return;

    const transaction: Transaction = {
      amount: partialAmount,
      paymentMethod: selectedMethod,
      status: 'pending',
    };

    try {
      const { data, error } = await supabaseClient.from('transactions').insert([transaction]);
      if (error) throw error;
      onPaymentSuccess(data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      <h2>Payment Form</h2>
      <label>
        Payment Method:
        <select value={selectedMethod?.id} onChange={(event) => handlePaymentMethodChange(paymentMethods.find((method) => method.id === event.target.value))}>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Partial Amount:
        <input type="number" value={partialAmount} onChange={handlePartialAmountChange} />
      </label>
      <button type="submit">Pay</button>
    </form>
  );
};

export default PaymentForm;