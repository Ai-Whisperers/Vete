"use client";

import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gift,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Tag,
  Scissors,
  Package,
  PartyPopper,
  Copy,
  ArrowLeft,
  History,
} from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  category: string;
  points_cost: number;
  value_display: string | null;
  stock: number | null;
  max_per_user: number | null;
  valid_to: string | null;
  image_url: string | null;
  user_redemption_count: number;
}

interface Redemption {
  id: string;
  points_spent: number;
  status: string;
  redemption_code: string;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
  reward: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    value_display: string | null;
  };
}

export default function RewardsPage(): JSX.Element {
  const params = useParams();
  const clinic = params?.clinic as string;

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [clinic]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch rewards, redemptions, and points balance in parallel
      const [rewardsRes, redemptionsRes] = await Promise.all([
        fetch(`/api/loyalty/rewards?clinic=${clinic}`),
        fetch('/api/loyalty/redeem'),
      ]);

      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data.data || []);
      }

      if (redemptionsRes.ok) {
        const data = await redemptionsRes.json();
        setRedemptions(data.data || []);
      }

      // Get points balance from user's pets
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const me = await meRes.json();
        if (me.id) {
          // Get pets and sum loyalty points
          const petsRes = await fetch(`/api/pets?owner=${me.id}`);
          if (petsRes.ok) {
            const petsData = await petsRes.json();
            const pets = petsData.data || [];
            let total = 0;
            for (const pet of pets) {
              const pointsRes = await fetch(`/api/loyalty_points?petId=${pet.id}`);
              if (pointsRes.ok) {
                const pointsData = await pointsRes.json();
                total += pointsData.balance || 0;
              }
            }
            setPointsBalance(total);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward): Promise<void> => {
    if (redeeming) return;
    if (pointsBalance < reward.points_cost) {
      alert('No tienes suficientes puntos para esta recompensa');
      return;
    }

    if (!confirm(`¿Canjear "${reward.name}" por ${reward.points_cost} puntos?`)) {
      return;
    }

    setRedeeming(reward.id);
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: reward.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al canjear');
      }

      const result = await response.json();
      setSuccessCode(result.redemption.code);
      setPointsBalance(prev => prev - reward.points_cost);
      fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al canjear recompensa');
    } finally {
      setRedeeming(null);
    }
  };

  const copyCode = (code: string): void => {
    navigator.clipboard.writeText(code);
    alert('Código copiado');
  };

  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case 'discount':
        return <Tag className="w-5 h-5" />;
      case 'service':
        return <Scissors className="w-5 h-5" />;
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'gift':
        return <Gift className="w-5 h-5" />;
      case 'experience':
        return <PartyPopper className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Disponible
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Usado
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando recompensas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <Link
            href={`/${clinic}/portal`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Portal
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Gift className="w-8 h-8" />
                Club de Puntos
              </h1>
              <p className="text-white/80 mt-1">
                Canjea tus puntos por increíbles recompensas
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-3xl font-bold">
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                {pointsBalance.toLocaleString('es-PY')}
              </div>
              <p className="text-white/80 text-sm">puntos disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Canjeo Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Presenta este código en la clínica para reclamar tu recompensa
            </p>
            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <p className="text-3xl font-mono font-bold text-gray-900 tracking-widest">
                {successCode}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyCode(successCode)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
              <button
                onClick={() => setSuccessCode(null)}
                className="flex-1 px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Toggle Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              !showHistory
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            Recompensas
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showHistory
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            Mis Canjes
          </button>
        </div>

        {!showHistory ? (
          <>
            {/* Rewards Grid */}
            {rewards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  No hay recompensas disponibles
                </h2>
                <p className="text-gray-600">
                  Pronto agregaremos más opciones para canjear tus puntos
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {rewards.map((reward) => {
                  const canRedeem = pointsBalance >= reward.points_cost;
                  const outOfStock = reward.stock !== null && reward.stock <= 0;
                  const maxReached =
                    reward.max_per_user !== null &&
                    reward.user_redemption_count >= reward.max_per_user;

                  return (
                    <div
                      key={reward.id}
                      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                        outOfStock || maxReached
                          ? 'opacity-60 border-gray-200'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {reward.name}
                            </h3>
                            {reward.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {reward.description}
                              </p>
                            )}
                            {reward.value_display && (
                              <p className="text-purple-600 font-medium text-sm mt-2">
                                {reward.value_display}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900">
                              {reward.points_cost.toLocaleString('es-PY')} pts
                            </span>
                          </div>

                          {outOfStock ? (
                            <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                              Agotado
                            </span>
                          ) : maxReached ? (
                            <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                              Límite alcanzado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRedeem(reward)}
                              disabled={!canRedeem || redeeming === reward.id}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                canRedeem
                                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {redeeming === reward.id
                                ? 'Canjeando...'
                                : canRedeem
                                ? 'Canjear'
                                : 'Puntos insuficientes'}
                            </button>
                          )}
                        </div>

                        {reward.stock !== null && reward.stock > 0 && reward.stock <= 10 && (
                          <p className="text-orange-600 text-xs mt-3 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Solo quedan {reward.stock} unidades
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Redemption History */}
            {redemptions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Sin canjes aún
                </h2>
                <p className="text-gray-600">
                  Cuando canjees una recompensa, aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                          {getCategoryIcon(redemption.reward.category)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {redemption.reward.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(redemption.created_at)} • -{redemption.points_spent} pts
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(redemption.status)}
                    </div>

                    {redemption.status === 'approved' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Código de canje</p>
                          <p className="font-mono font-bold text-gray-900">
                            {redemption.redemption_code}
                          </p>
                        </div>
                        <button
                          onClick={() => copyCode(redemption.redemption_code)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {redemption.expires_at && redemption.status === 'approved' && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Vence: {formatDate(redemption.expires_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
