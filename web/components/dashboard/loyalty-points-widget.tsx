"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Star,
  TrendingUp,
  History,
  Plus,
  Minus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface LoyaltyTransaction {
  id: string;
  points: number;
  description: string;
  type: "earned" | "redeemed" | "adjustment";
  created_at: string;
}

interface LoyaltyPointsWidgetProps {
  clientId: string;
  clinic: string;
  initialBalance?: number;
  compact?: boolean;
}

export function LoyaltyPointsWidget({
  clientId,
  clinic,
  initialBalance = 0,
  compact = false,
}: LoyaltyPointsWidgetProps): React.ReactElement {
  const [balance, setBalance] = useState(initialBalance);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const labels = useDashboardLabels();

  useEffect(() => {
    const fetchLoyaltyData = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/clients/${clientId}/loyalty?clinic=${clinic}`
        );
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance || 0);
          setLifetimeEarned(data.lifetime_earned || 0);
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching loyalty data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [clientId, clinic]);

  const handleAddPoints = async (): Promise<void> => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic,
          points,
          description: addDescription || (points > 0 ? labels.loyalty.points_added : labels.loyalty.points_redeemed),
          type: points > 0 ? "earned" : "redeemed",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        if (points > 0) {
          setLifetimeEarned((prev) => prev + points);
        }
        setTransactions((prev) => [data.transaction, ...prev]);
        setPointsToAdd("");
        setAddDescription("");
        setShowAddPoints(false);
      }
    } catch (error) {
      console.error("Error adding points:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("es-PY", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPointsLevel = (points: number): { name: string; color: string; nextLevel: number } => {
    if (points >= 5000) return { name: labels.loyalty.levels.platinum, color: "text-purple-600 bg-purple-100", nextLevel: Infinity };
    if (points >= 2000) return { name: labels.loyalty.levels.gold, color: "text-amber-600 bg-amber-100", nextLevel: 5000 };
    if (points >= 500) return { name: labels.loyalty.levels.silver, color: "text-gray-600 bg-gray-200", nextLevel: 2000 };
    return { name: labels.loyalty.levels.bronze, color: "text-orange-600 bg-orange-100", nextLevel: 500 };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[var(--border-color)] p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  const level = getPointsLevel(lifetimeEarned);
  const progressToNextLevel = level.nextLevel === Infinity
    ? 100
    : Math.min(100, (lifetimeEarned / level.nextLevel) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] rounded-lg text-white">
        <Star className="w-4 h-4" />
        <span className="font-bold">{balance.toLocaleString()}</span>
        <span className="text-sm opacity-80">{labels.loyalty.points}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">{labels.loyalty.title}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${level.color}`}>
            {level.name}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{labels.loyalty.current_balance}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--text-primary)]">
                {balance.toLocaleString()}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">pts</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text-secondary)]">{labels.loyalty.lifetime_earned}</p>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">{lifetimeEarned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        {level.nextLevel !== Infinity && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">{labels.loyalty.next_level}</span>
              <span className="text-[var(--text-secondary)]">
                {lifetimeEarned.toLocaleString()} / {level.nextLevel.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))]"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowAddPoints(!showAddPoints)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {labels.loyalty.add}
          </button>
          <button
            onClick={() => {
              setShowAddPoints(true);
              setPointsToAdd("-");
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Minus className="w-4 h-4" />
            {labels.loyalty.redeem}
          </button>
        </div>

        {/* Add Points Form */}
        <AnimatePresence>
          {showAddPoints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-gray-50 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    {labels.loyalty.points}
                  </label>
                  <input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder="Ej: 100 o -50"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Ej: Compra de producto"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPoints}
                    disabled={isSubmitting || !pointsToAdd}
                    className="flex-1 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      labels.loyalty.confirm
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPoints(false);
                      setPointsToAdd("");
                      setAddDescription("");
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    {labels.common.cancel}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction History Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            {labels.loyalty.transaction_history}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Transaction History */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {transactions.length > 0 ? (
                <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-full ${
                            tx.type === "earned"
                              ? "bg-green-100 text-green-600"
                              : tx.type === "redeemed"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tx.type === "earned" ? (
                            <Plus className="w-3 h-3" />
                          ) : tx.type === "redeemed" ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-primary)]">
                            {tx.description}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          tx.points > 0 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {tx.points > 0 ? "+" : ""}
                        {tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  No hay transacciones registradas
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
