"use client";

import { useActionState } from "react";
import * as Icons from "lucide-react";
import { createPet } from "@/app/actions/create-pet";
import { useState } from "react";
import Link from "next/link"; // Added Link import
import { useParams } from "next/navigation";

export default function NewPetPage() {
  const { clinic } = useParams();
  const [state, formAction, isPending] = useActionState(createPet, null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors">
                <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>
            <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nueva Mascota</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="clinic" value={clinic} />

                {/* Photo Upload */}
                <div className="flex justify-center">
                    <div className="relative group cursor-pointer">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 ${preview ? 'border-[var(--primary)]' : 'border-gray-100 bg-gray-50'}`}>
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" />
                            ) : (
                                <Icons.Camera className="w-10 h-10 text-gray-300" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-xs ring-2 ring-white px-2 py-1 rounded-full">Cambiar</span>
                        </div>
                        <input 
                            name="photo"
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400">Toca para subir una foto</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nombre</label>
                        <input 
                            name="name"
                            required 
                            type="text" 
                            placeholder="Ej: Firulais"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Especie</label>
                        <select 
                            name="species"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white"
                        >
                            <option value="dog">Perro 🐕</option>
                            <option value="cat">Gato 🐈</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Raza</label>
                        <input 
                            name="breed"
                            type="text" 
                            placeholder="Ej: Caniche"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Peso (kg)</label>
                        <input 
                            name="weight"
                            type="number" 
                            step="0.1"
                            placeholder="0.0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>
                </div>

                {/* Physical Specs */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Color/Señas</label>
                        <input name="color" type="text" placeholder="Ej: Mancha blanca en pecho" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none" />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                         <div className="flex items-center gap-2">
                            <input type="radio" name="sex" value="male" id="male" className="w-4 h-4 text-[var(--primary)]" required />
                            <label htmlFor="male" className="font-bold text-gray-600">Macho</label>
                         </div>
                         <div className="flex items-center gap-2">
                            <input type="radio" name="sex" value="female" id="female" className="w-4 h-4 text-[var(--primary)]" required />
                            <label htmlFor="female" className="font-bold text-gray-600">Hembra</label>
                         </div>
                         <div className="flex items-center gap-2 ml-4">
                            <input type="checkbox" name="is_neutered" id="neutered" className="w-5 h-5 rounded text-[var(--primary)]" />
                            <label htmlFor="neutered" className="text-sm font-bold text-gray-500">Castrado</label>
                         </div>
                    </div>
                </div>

                {/* Health & Behavior */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-[var(--text-primary)]">Salud y Comportamiento</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Temperamento</label>
                            <select name="temperament" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white">
                                <option value="unknown">Desconocido</option>
                                <option value="friendly">Amigable</option>
                                <option value="shy">Tímido/Miedoso</option>
                                <option value="aggressive">Agresivo</option>
                                <option value="calm">Tranquilo</option>
                            </select>
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Alergias</label>
                             <input name="allergies" type="text" placeholder="Ej: Pollo, Penicilina" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none" />
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Condiciones Preexistentes</label>
                         <textarea name="existing_conditions" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none resize-none" rows={2} placeholder="Ej: Hipotiroidismo, Displasia..."></textarea>
                    </div>
                </div>

                {/* Additional Info: Microchip & Diet */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-[var(--text-primary)]">Detalles Adicionales</h3>
                    
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Microchip / ID</label>
                        <input 
                            name="microchip_id"
                            type="text" 
                            placeholder="Ej: 9810981098"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Tipo de Dieta</label>
                            <select 
                                name="diet_category"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="balanced">Balanceado Seco</option>
                                <option value="wet">Alimento Húmedo</option>
                                <option value="raw">Dieta BARF / Natural</option>
                                <option value="mixed">Mixta</option>
                                <option value="prescription">Prescripción Médica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Notas de Dieta</label>
                            <input 
                                name="diet_notes"
                                type="text"
                                placeholder="Ej: Marca Royal Canin, alergia al pollo"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>
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
                    {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Guardar Mascota"}
                </button>
            </form>
        </div>
    </div>
  );
}
