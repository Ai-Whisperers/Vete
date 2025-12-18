"use client";

import { useActionState } from "react";
import * as Icons from "lucide-react";
import { createProduct } from "@/app/actions/create-product";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewProductPage() {
  const { clinic } = useParams();
  // Use `as any` to bypass strict typing on the action for now if needed, or fix the action signature
  const [state, formAction, isPending] = useActionState(createProduct, null);

  return (
    <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/${clinic}/portal/products`} className="p-2 rounded-xl hover:bg-white transition-colors">
                <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>
            <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nuevo Producto</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="clinic" value={clinic} />

                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nombre del Producto</label>
                    <input 
                        name="name"
                        required 
                        type="text" 
                        placeholder="Ej: Pipeta Antipulgas"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Categoría</label>
                    <select 
                        name="category"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white"
                    >
                        <option value="dog">Perros 🐕</option>
                        <option value="cat">Gatos 🐈</option>
                        <option value="exotic">Exóticos 🦜</option>
                        <option value="other">Otro 📦</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Precio ($)</label>
                        <input 
                            name="price"
                            required
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>
                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Stock Inicial</label>
                        <input 
                            name="stock"
                            required
                            type="number" 
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                    <Icons.Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                        Los productos creados solo serán visibles para el personal de esta clínica ({clinic}).
                    </p>
                </div>

                {state?.error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <Icons.AlertCircle className="w-4 h-4" />
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Crear Producto"}
                </button>
            </form>
        </div>
    </div>
  );
}
