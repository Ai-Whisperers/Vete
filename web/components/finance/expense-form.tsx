"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus } from "lucide-react";

interface ExpenseFormProps {
    onSuccess: () => void;
    clinicId: string;
}

export default function ExpenseForm({ onSuccess, clinicId }: ExpenseFormProps) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category: 'rent',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinic_id: clinicId,
                    ...formData
                })
            });

            if (res.ok) {
                showToast("Expense logged successfully");
                setFormData({ ...formData, amount: '', description: '' });
                onSuccess();
            } else {
                throw new Error("Failed to log expense");
            }
        } catch (e) {
            showToast("Error saving expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900">Log New Expense</h3>
                <div className="p-2 bg-gray-50 rounded-full"><Plus className="w-5 h-5 text-gray-400" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                        className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="supplies">Supplies</option>
                        <option value="payroll">Payroll</option>
                        <option value="marketing">Marketing</option>
                        <option value="software">Software</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                    <input 
                        type="number" 
                        required
                        className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
                <input 
                    type="date"
                    required 
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <input 
                    type="text" 
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-medium text-gray-700 outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="E.g. Monthly cloud hosting"
                />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Record'}
            </button>
        </form>
    );
}
