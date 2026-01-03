'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Gift, ChevronRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoyaltyData {
  points: number;
  tier: string | null;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

interface LoyaltyWidgetProps {
  userId?: string;
  compact?: boolean;
  className?: string;
}

// Points to currency conversion (1 point = 100 Gs)
const POINTS_TO_CURRENCY = 100;

// Tier configuration
const TIERS = {
  bronze: { name: 'Bronce', color: 'text-amber-700', bg: 'bg-amber-100', min: 0 },
  silver: { name: 'Plata', color: 'text-gray-500', bg: 'bg-gray-200', min: 500 },
  gold: { name: 'Oro', color: 'text-yellow-600', bg: 'bg-yellow-100', min: 2000 },
  platinum: { name: 'Platino', color: 'text-purple-600', bg: 'bg-purple-100', min: 5000 },
};

export default function LoyaltyWidget({ userId, compact = false, className }: LoyaltyWidgetProps) {
  const { clinic } = useParams() as { clinic: string };
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/loyalty/points?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const loyaltyData = await res.json();
        setData(loyaltyData);
      } catch (e) {
        console.error('Error fetching loyalty data:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [userId]);

  const formatPrice = (price: number): string => {
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  const getTierConfig = (tier: string | null) => {
    if (!tier || !TIERS[tier as keyof typeof TIERS]) {
      return TIERS.bronze;
    }
    return TIERS[tier as keyof typeof TIERS];
  };

  // Don't show if no user or loading
  if (!userId || loading) {
    if (loading && userId) {
      return (
        <div className={clsx('flex items-center gap-2', className)}>
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
        </div>
      );
    }
    return null;
  }

  // Don't show if error or no data
  if (error || !data) {
    return null;
  }

  const tierConfig = getTierConfig(data.tier);
  const pointsValue = data.points * POINTS_TO_CURRENCY;

  // Compact version for header
  if (compact) {
    return (
      <Link
        href={`/${clinic}/portal/loyalty`}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-full transition hover:opacity-80',
          tierConfig.bg,
          className
        )}
      >
        <Star className={clsx('w-4 h-4', tierConfig.color)} />
        <span className={clsx('font-bold text-sm', tierConfig.color)}>
          {data.points.toLocaleString()}
        </span>
      </Link>
    );
  }

  // Full widget
  return (
    <div className={clsx('bg-white rounded-2xl border border-gray-100 shadow-sm p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', tierConfig.bg)}>
            <Star className={clsx('w-4 h-4', tierConfig.color)} />
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)]">Mis Puntos</span>
            <span className={clsx('ml-2 px-2 py-0.5 rounded-full text-xs font-medium', tierConfig.bg, tierConfig.color)}>
              {tierConfig.name}
            </span>
          </div>
        </div>
        <Link
          href={`/${clinic}/portal/loyalty`}
          className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          Ver más
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[var(--primary)]">
            {data.points.toLocaleString()}
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            puntos = {formatPrice(pointsValue)}
          </div>
        </div>

        {data.points >= 100 && (
          <Link
            href={`/${clinic}/portal/loyalty`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition"
          >
            <Gift className="w-4 h-4" />
            Canjear
          </Link>
        )}
      </div>
    </div>
  );
}

// Export a version that fetches user ID from session
export function LoyaltyWidgetWithAuth(props: Omit<LoyaltyWidgetProps, 'userId'>) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for user in session
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUserId(data.user?.id || null);
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      }
    };

    checkAuth();
  }, []);

  if (!userId) return null;

  return <LoyaltyWidget {...props} userId={userId} />;
}
