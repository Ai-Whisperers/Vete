import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PromoCode {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit: number;
  createdAt: Date;
}

const PromoCodeForm = () => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from<PromoCode>('promo_codes')
        .insert([{ code, discountType, discountValue, usageLimit }]);
      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Code:
        <input type="text" value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      <label>
        Discount Type:
        <select value={discountType} onChange={(event) => setDiscountType(event.target.value as 'percentage' | 'fixed')}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </label>
      <label>
        Discount Value:
        <input type="number" value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} />
      </label>
      <label>
        Usage Limit:
        <input type="number" value={usageLimit} onChange={(event) => setUsageLimit(Number(event.target.value))} />
      </label>
      <button type="submit">Create Promo Code</button>
    </form>
  );
};

export default PromoCodeForm;