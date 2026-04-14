import { Transaction } from '../types';

interface ReceiptProps {
  transaction: Transaction;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  return (
    <div>
      <h2>Receipt</h2>
      <p>Transaction ID: {transaction.id}</p>
      <p>Amount: {transaction.amount}</p>
      <p>Payment Method: {transaction.paymentMethod.name}</p>
      <p>Status: {transaction.status}</p>
    </div>
  );
};

export default Receipt;