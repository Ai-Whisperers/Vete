"use client";

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, TrendingUp, Info, Loader2, AlertCircle } from 'lucide-react';

interface GrowthStandard {
    age_weeks: number;
    weight_kg: number;
    percentile: string;
}

interface WeightRecord {
    date: string;
    weight_kg: number;
    age_weeks?: number; // Calculated or stored
}

interface GrowthChartProps {
    breed: string;
    gender: 'male' | 'female';
    patientRecords: WeightRecord[];
}

// Breed size classifications for fallback
const BREED_SIZE_MAP: Record<string, string> = {
    // Small breeds
    'Chihuahua': 'Small Dog',
    'Yorkshire': 'Small Dog',
    'Pomeranian': 'Small Dog',
    'Maltese': 'Small Dog',
    'Shih Tzu': 'Small Dog',
    // Medium breeds
    'Beagle': 'Medium Dog',
    'Bulldog': 'Medium Dog',
    'Cocker': 'Medium Dog',
    'Border Collie': 'Medium Dog',
    // Large breeds
    'Labrador': 'Large Dog',
    'Retriever': 'Large Dog',
    'Golden Retriever': 'Large Dog',
    'German Shepherd': 'Large Dog',
    'Rottweiler': 'Large Dog',
    // Giant breeds
    'Great Dane': 'Giant Dog',
    'Mastiff': 'Giant Dog',
    'Saint Bernard': 'Giant Dog',
};

function getBreedFallback(breed: string): { searchBreed: string; isExact: boolean } {
    // First try exact match
    if (breed in BREED_SIZE_MAP) {
        return { searchBreed: breed, isExact: true };
    }

    // Try to find a partial match in the breed name
    for (const [key, size] of Object.entries(BREED_SIZE_MAP)) {
        if (breed.toLowerCase().includes(key.toLowerCase())) {
            return { searchBreed: size, isExact: false };
        }
    }

    // Default to Medium Dog if no match found
    return { searchBreed: 'Medium Dog', isExact: false };
}

export function GrowthChart({ breed, gender, patientRecords }: GrowthChartProps) {
    const [standardData, setStandardData] = useState<GrowthStandard[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [actualBreedUsed, setActualBreedUsed] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandard = async () => {
            setLoading(true);
            setError(null);

            // Determine which breed to search for
            const { searchBreed, isExact } = getBreedFallback(breed);
            setActualBreedUsed(searchBreed);
            setUsingFallback(!isExact);

            try {
                // First try with the exact breed
                let res = await fetch(`/api/growth_standards?breed=${encodeURIComponent(breed)}&gender=${gender}`);
                let data = res.ok ? await res.json() : [];

                // If no data, try with the fallback breed
                if (!data || data.length === 0) {
                    res = await fetch(`/api/growth_standards?breed=${encodeURIComponent(searchBreed)}&gender=${gender}`);
                    if (res.ok) {
                        data = await res.json();
                        setUsingFallback(true);
                    }
                } else {
                    setUsingFallback(false);
                    setActualBreedUsed(breed);
                }

                setStandardData(data || []);
            } catch {
                setError('No se pudieron cargar los datos de crecimiento estándar.');
            } finally {
                setLoading(false);
            }
        };
        fetchStandard();
    }, [breed, gender]);

    // Merge Data for Recharts
    // We need a common X-axis (Age in Weeks)
    // 1. Map patient records to approximate age in weeks. 
    // For MVP, assuming patientRecords has dates and we know birthdate, but passing 'age_weeks' directly in props is simpler for now.
    // Let's assume patientRecords has { age_weeks, weight_kg }
    
    // Combining data: Create an array of all weeks from 0 to 52
    const chartData = [];
    for (let i = 0; i <= 52; i+=4) {
        const std = standardData.find(d => d.age_weeks >= i && d.age_weeks < i+4); // approximate
        
        // Find patient record near this week
        const patient = patientRecords.find(p => p.age_weeks && Math.abs(p.age_weeks - i) < 2);

        chartData.push({
            name: `${i} sem`,
            age: i,
            Standard: std ? std.weight_kg : null,
            Patient: patient ? patient.weight_kg : null
        });
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Cargando gráfico...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                        Curva de Crecimiento
                    </h3>
                    <p className="text-sm text-gray-500">Comparativa vs Estándar ({actualBreedUsed || breed})</p>
                </div>
            </div>

            {/* Warning if using fallback data */}
            {usingFallback && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
                    <div className="flex gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-700">
                            No hay datos específicos para "{breed}". Usando datos de referencia para {actualBreedUsed}.
                            Los valores pueden no ser exactos para esta raza.
                        </p>
                    </div>
                </div>
            )}

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 12}} />
                        <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} unit=" kg" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Standard" stroke="#E5E7EB" strokeWidth={2} dot={false} name="Promedio Raza" />
                        <Line type="monotone" dataKey="Patient" stroke="var(--primary)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Paciente" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
