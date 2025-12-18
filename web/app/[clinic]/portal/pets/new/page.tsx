"use client";

import { useActionState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { createPet } from "@/app/actions/create-pet";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PhotoUpload } from "@/components/pets/photo-upload";

export default function NewPetPage() {
  const { clinic } = useParams();
  const [state, formAction, isPending] = useActionState(createPet, null);

  return (
    <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver al dashboard">
                <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>
            <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nueva Mascota</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="clinic" value={clinic} />

                {/* Photo Upload */}
                <PhotoUpload
                    name="photo"
                    placeholder="Subir foto"
                    shape="circle"
                    size={128}
                    maxSizeMB={5}
                />

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
                            min="0"
                            max="500"
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
                    <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin w-5 h-5"/> : "Guardar Mascota"}
                </button>
            </form>
        </div>
    </div>
  );
}
