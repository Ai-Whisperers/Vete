"use client";

import { useEffect, useState } from 'react';
import { Gift, Star } from 'lucide-react';

// TICKET-TYPE-003: Define proper types for component props
interface ClinicConfig {
    config?: {
        name?: string;
    };
}

interface LoyaltyCardProps {
    petId: string;
    petName: string;
    clinicConfig: ClinicConfig;
}

export function LoyaltyCard({ petId, petName, clinicConfig }: LoyaltyCardProps) {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch(`/api/loyalty_points?petId=${petId}`);
                const data = await res.json();
                if (typeof data.balance === 'number') {
                    setBalance(data.balance);
                }
            } catch (e) {
                console.error("Failed to fetch loyalty points", e);
            } finally {
                setLoading(false);
            }
        };

        if (petId) fetchBalance();
    }, [petId]);

    if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-xl w-full"></div>;

    // Configurable tiers or next reward logic could go here
    const nextReward = 500;
    const progress = Math.min(100, Math.max(0, ((balance || 0) / nextReward) * 100));

    return (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="font-bold text-lg text-purple-100">Puntos {clinicConfig.config?.name || 'Veterinaria'}</h3>
                    <p className="text-sm text-purple-200">{petName}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <span className="text-4xl font-black">{balance || 0}</span>
                <span className="text-purple-200 ml-2 text-sm">pts</span>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between text-xs text-purple-200 mb-1">
                    <span>Próximo premio</span>
                    <span>{nextReward} pts</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {balance !== null && balance >= nextReward && (
                    <div className="mt-3 bg-white/20 rounded-lg p-2 text-xs flex items-center gap-2 animate-bounce">
                        <Gift className="w-4 h-4" />
                        <span>¡Puedes un canje disponible!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
