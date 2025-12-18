"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExpenseForm from "@/components/finance/expense-form";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function FinanceDashboardClient() {
    const { clinic } = useParams() as { clinic: string };
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch(`/api/finance/pl?clinic=${clinic}`);
        if (res.ok) {
            const json = await res.json();
            setData(json);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [clinic]);

    if (loading) return <div className="p-10 text-center text-gray-400 font-bold">Loading Financial Data...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Financial Overview</h1>
                    <p className="text-gray-500 font-medium">Profit & Loss Statement</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-500">
                    Current Period: All Time
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h2 className="text-3xl font-black text-gray-900">
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(data?.revenue || 0)}
                        </h2>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Expenses</p>
                        <h2 className="text-3xl font-black text-gray-900">
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(data?.expenses || 0)}
                        </h2>
                    </div>
                </div>

                {/* Net Income Card */}
                <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gray-800 rounded-full -mr-20 -mt-20 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Net Income</p>
                        <h2 className={`text-3xl font-black ${data?.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(data?.netIncome || 0)}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Placeholder) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Expense Breakdown
                    </h3>
                    
                    {Object.keys(data?.breakdown || {}).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(data.breakdown).map(([cat, amount]: [string, any]) => (
                                <div key={cat} className="flex items-center gap-4 group">
                                    <div className="w-32 text-sm font-bold text-gray-500 uppercase tracking-wider">{cat}</div>
                                    <div className="flex-1 bg-gray-50 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full" 
                                            style={{ width: `${Math.min((amount / data.expenses) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-32 text-right font-black text-gray-900">
                                        {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                            <PieChart className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No expenses recorded yet.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <ExpenseForm onSuccess={fetchData} clinicId={clinic} />
                    
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2">Commissions (Beta)</h4>
                        <p className="text-sm text-indigo-700/80 leading-relaxed mb-4">
                            Track staff performance and generated revenue from appointments and sales.
                        </p>
                        <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-indigo-50 border border-indigo-100 transition-all">
                            View Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
