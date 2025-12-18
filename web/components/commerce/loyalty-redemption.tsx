"use client";

import { useState, useEffect } from 'react';
import { Star, Gift, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/components/ui/Toast';

interface LoyaltyRedemptionProps {
  userId: string;
}

export default function LoyaltyRedemption({ userId }: LoyaltyRedemptionProps) {
  const supabase = createClient();
  const { total, discount, setDiscount } = useCart();
  const { showToast } = useToast();
  
  const [points, setPoints] = useState<number | null>(null);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Rules: 1 point = 100 PYG
  const POINT_VALUE = 100;

  useEffect(() => {
    const loadPoints = async () => {
      const { data } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('profile_id', userId)
        .maybeSingle();
      
      setPoints(data?.points || 0);
      setIsLoading(false);
    };
    loadPoints();
  }, [userId, supabase]);

  const maxRedeemablePoints = points ? Math.min(points, Math.floor(total / POINT_VALUE)) : 0;

  const handleApply = () => {
    if (redeemAmount > maxRedeemablePoints) {
      showToast("No tienes suficientes puntos");
      return;
    }
    const discountValue = redeemAmount * POINT_VALUE;
    setDiscount(discountValue);
    showToast(`Descuento de ${new Intl.NumberFormat('es-PY').format(discountValue)} aplicado`);
  };

  if (isLoading) return null;
  if (!points || points < 100) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-[2rem] border border-purple-100 shadow-sm mb-6 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-[0.03] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
           <Star className="w-6 h-6 text-white fill-current" />
        </div>
        <div>
            <h4 className="font-black text-gray-900 leading-tight">Club de Puntos</h4>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-widest">Tienes {points} puntos acumulados</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Canjear puntos por descuento</span>
          <span className="font-black text-gray-900">1 pt = {POINT_VALUE} PYG</span>
        </div>

        <div className="flex gap-2">
            <div className="flex-1 relative">
                <input 
                    type="range" 
                    min="0" 
                    max={maxRedeemablePoints}
                    step="100"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-2">
                    <span>0 pts</span>
                    <span>{maxRedeemablePoints} pts</span>
                </div>
            </div>
            <div className="text-right shrink-0 min-w-[80px]">
                <div className="text-sm font-black text-purple-600">-{new Intl.NumberFormat('es-PY').format(redeemAmount * POINT_VALUE)}</div>
                <div className="text-[10px] text-gray-400 font-bold">{redeemAmount} pts</div>
            </div>
        </div>

        {discount > 0 ? (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100 italic transition-all">
                <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Descuento Aplicado</span>
                </div>
                <button onClick={() => setDiscount(0)} className="text-[10px] font-black text-green-700/50 hover:text-red-500 uppercase">Eliminar</button>
            </div>
        ) : (
            <button 
                onClick={handleApply}
                disabled={redeemAmount === 0}
                className="w-full py-3 bg-purple-600 text-white font-black rounded-xl shadow-lg shadow-purple-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
            >
                Aplicar Puntos <Gift className="w-4 h-4" />
            </button>
        )}
      </div>
    </div>
  );
}
