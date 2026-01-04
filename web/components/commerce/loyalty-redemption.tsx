'use client'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Star, Gift, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/components/ui/Toast'

const queryClient = new QueryClient()

/** Points value in currency (e.g., 100 points = 1 unit of currency) */
const POINT_VALUE = 100

export default function LoyaltyRedemptionWrapper(props: LoyaltyRedemptionProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LoyaltyRedemption {...props} />
    </QueryClientProvider>
  )
}

interface LoyaltyRedemptionProps {
  userId: string
}

function LoyaltyRedemption({ userId }: LoyaltyRedemptionProps) {
  const { total, discount, setDiscount } = useCart()
  const { showToast } = useToast()

  const { data: pointsData, isLoading } = useQuery<{ points: number }>({
    queryKey: ['loyaltyPoints', userId],
    queryFn: async () => {
      const res = await fetch(`/api/loyalty/points?userId=${userId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch loyalty points')
      }
      return res.json()
    },
  })

  const points = pointsData?.points || 0

  const [redeemAmount, setRedeemAmount] = useState(0)

  const maxRedeemablePoints = points ? Math.min(points, Math.floor(total / POINT_VALUE)) : 0

  const handleApply = () => {
    if (redeemAmount > maxRedeemablePoints) {
      showToast('No tienes suficientes puntos')
      return
    }
    const discountValue = redeemAmount * POINT_VALUE
    setDiscount(discountValue)
    showToast(`Descuento de ${new Intl.NumberFormat('es-PY').format(discountValue)} aplicado`)
  }

  if (isLoading) return null
  if (!points || points < 100) return null

  return (
    <div className="group relative mb-6 overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
      <div className="absolute right-0 top-0 -mr-12 -mt-12 h-24 w-24 rounded-full bg-purple-500 opacity-[0.03] transition-transform duration-700 group-hover:scale-150"></div>

      <div className="relative z-10 mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shadow-lg shadow-purple-200">
          <Star className="h-6 w-6 fill-current text-white" />
        </div>
        <div>
          <h4 className="font-black leading-tight text-gray-900">Club de Puntos</h4>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600">
            Tienes {points} puntos acumulados
          </p>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-500">Canjear puntos por descuento</span>
          <span className="font-black text-gray-900">1 pt = {POINT_VALUE} PYG</span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="range"
              min="0"
              max={maxRedeemablePoints}
              step="100"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-purple-100 accent-purple-600"
            />
            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-gray-400">
              <span>0 pts</span>
              <span>{maxRedeemablePoints} pts</span>
            </div>
          </div>
          <div className="min-w-[80px] shrink-0 text-right">
            <div className="text-sm font-black text-purple-600">
              -{new Intl.NumberFormat('es-PY').format(redeemAmount * POINT_VALUE)}
            </div>
            <div className="text-[10px] font-bold text-gray-400">{redeemAmount} pts</div>
          </div>
        </div>

        {discount > 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-3 italic transition-all">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Descuento Aplicado
              </span>
            </div>
            <button
              onClick={() => setDiscount(0)}
              className="text-[10px] font-black uppercase text-green-700/50 hover:text-red-500"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={redeemAmount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-black text-white shadow-lg shadow-purple-100 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-30 disabled:shadow-none"
          >
            Aplicar Puntos <Gift className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
