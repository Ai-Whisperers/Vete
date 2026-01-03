'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ChevronRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface CartLoyaltyDisplayProps {
  userId?: string;
  cartTotal?: number;
  compact?: boolean;
  className?: string;
}

const POINTS_TO_CURRENCY = 100; // 1 point = 100 Gs
const EARN_RATE = 0.01; // 1 point per 100 Gs spent

/**
 * Displays user's loyalty points and potential earnings in cart context
 */
export function CartLoyaltyDisplay({
  userId,
  cartTotal = 0,
  compact = false,
  className,
}: CartLoyaltyDisplayProps) {
  const { clinic } = useParams() as { clinic: string };
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate points to earn from this purchase
  const pointsToEarn = Math.floor(cartTotal * EARN_RATE);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPoints = async () => {
      try {
        const res = await fetch(`/api/loyalty/points?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPoints(data.points || 0);
        }
      } catch (e) {
        console.error('Error fetching loyalty points:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [userId]);

  // Don't show if no user
  if (!userId) return null;

  // Loading state
  if (loading) {
    return (
      <div className={clsx('flex items-center gap-2 text-[var(--text-muted)]', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  // Compact version for cart drawer
  if (compact) {
    return (
      <Link
        href={`/${clinic}/portal/loyalty`}
        className={clsx(
          'flex items-center justify-between py-3 px-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition group',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-purple-600" />
          <div>
            <span className="text-sm font-bold text-purple-900">
              {points?.toLocaleString() || 0} puntos
            </span>
            {pointsToEarn > 0 && (
              <span className="text-xs text-purple-600 ml-1">
                (+{pointsToEarn} con esta compra)
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition" />
      </Link>
    );
  }

  // Full version for checkout
  return (
    <div className={clsx(
      'bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-100',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-[var(--text-primary)]">Tus Puntos</div>
            <div className="text-xs text-[var(--text-muted)]">
              Valor: {new Intl.NumberFormat('es-PY').format((points || 0) * POINTS_TO_CURRENCY)} Gs
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-purple-600">
            {points?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-purple-500">puntos</div>
        </div>
      </div>

      {cartTotal > 0 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-purple-200/50">
          <span className="text-sm text-[var(--text-secondary)]">
            Ganarás con esta compra:
          </span>
          <span className="font-bold text-green-600">
            +{pointsToEarn} puntos
          </span>
        </div>
      )}

      <Link
        href={`/${clinic}/portal/loyalty`}
        className="mt-3 text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline"
      >
        Ver programa de lealtad <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
