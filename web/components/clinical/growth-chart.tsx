"use client";

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as Icons from 'lucide-react';

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

export function GrowthChart({ breed, gender, patientRecords }: GrowthChartProps) {
    const [standardData, setStandardData] = useState<GrowthStandard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStandard = async () => {
             // Fallback to "Medium Dog" if purebred data missing, just for demo
             const searchBreed = breed.includes('Retriever') ? 'Medium Dog' : 'Medium Dog'; 
             
             try {
                const res = await fetch(`/api/growth_standards?breed=${encodeURIComponent(searchBreed)}&gender=${gender}`);
                if (res.ok) {
                    const data = await res.json();
                    setStandardData(data);
                }
             } catch(e) {
                console.error(e);
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

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Cargando gráfico...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Icons.TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                        Curva de Crecimiento
                    </h3>
                    <p className="text-sm text-gray-500">Comparativa vs Estándar ({breed})</p>
                </div>
            </div>

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
