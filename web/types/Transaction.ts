interface PaymentMethod {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'success' | 'failed';
}

export { PaymentMethod, Transaction };