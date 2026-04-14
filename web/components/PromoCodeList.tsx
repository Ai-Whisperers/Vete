import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PromoCode {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit: number;
  createdAt: Date;
}

const PromoCodeList = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const { data, error } = await supabase
          .from<PromoCode>('promo_codes')
          .select('*');
        if (error) {
          console.error(error);
        } else {
          setPromoCodes(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPromoCodes();
  }, []);

  return (
    <ul>
      {promoCodes.map((promoCode) => (
        <li key={promoCode.id}>
          <p>Code: {promoCode.code}</p>
          <p>Discount Type: {promoCode.discountType}</p>
          <p>Discount Value: {promoCode.discountValue}</p>
          <p>Usage Limit: {promoCode.usageLimit}</p>
          <p>Created At: {promoCode.createdAt.toISOString()}</p>
        </li>
      ))}
    </ul>
  );
};

export default PromoCodeList;