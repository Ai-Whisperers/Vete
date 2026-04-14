import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface QRPaymentProps {
  amount: number;
  description: string;
}

const QRPayment: React.FC<QRPaymentProps> = ({ amount, description }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');

  useEffect(() => {
    const generateQRCode = async () => {
      const { data, error } = await supabase
        .from('payments')
        .insert([{ amount, description }])
        .select('id');

      if (error) {
        console.error(error);
        return;
      }

      const paymentId = data[0].id;
      const qrCodeUrl = `https://example.com/pay/${paymentId}`;
      setQrCode(qrCodeUrl);
    };

    generateQRCode();
  }, [amount, description]);

  const handlePaymentScan = async () => {
    // Simulate payment scanning
    const paymentStatus = await simulatePaymentScan(qrCode);
    setPaymentStatus(paymentStatus);
  };

  const handleConfirmation = async () => {
    // Simulate confirmation handling
    const confirmationStatus = await simulateConfirmation(qrCode);
    setPaymentStatus(confirmationStatus);
  };

  const handleReceiptGeneration = async () => {
    // Simulate receipt generation
    const receipt = await simulateReceiptGeneration(qrCode);
    console.log(receipt);
  };

  return (
    <div>
      {qrCode && (
        <img src={qrCode} alt="QR Code" />
      )}
      <button onClick={handlePaymentScan}>Scan Payment</button>
      <button onClick={handleConfirmation}>Confirm Payment</button>
      <button onClick={handleReceiptGeneration}>Generate Receipt</button>
      <p>Payment Status: {paymentStatus}</p>
    </div>
  );
};

const simulatePaymentScan = async (qrCode: string | null) => {
  // Simulate payment scanning
  return 'paid';
};

const simulateConfirmation = async (qrCode: string | null) => {
  // Simulate confirmation handling
  return 'paid';
};

const simulateReceiptGeneration = async (qrCode: string | null) => {
  // Simulate receipt generation
  return 'Receipt generated';
};

export default QRPayment;