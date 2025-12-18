'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { updatePet } from '@/app/actions/pets'
import { DeletePetButton } from './delete-pet-button'

interface Pet {
  id: string
  name: string
  species: string
  breed?: string | null
  weight_kg?: number | null
  microchip_id?: string | null
  diet_category?: string | null
  diet_notes?: string | null
  sex?: string | null
  is_neutered?: boolean
  color?: string | null
  temperament?: string | null
  allergies?: string | null
  existing_conditions?: string | null
  photo_url?: string | null
  birth_date?: string | null
}

interface Props {
  pet: Pet
  clinic: string
}

export function EditPetForm({ pet, clinic }: Props): React.ReactElement {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(pet.photo_url || null)
  const [removePhoto, setRemovePhoto] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      setRemovePhoto(false)
    }
  }

  const handleRemovePhoto = (): void => {
    setPreview(null)
    setRemovePhoto(true)
  }

  async function handleSubmit(formData: FormData): Promise<void> {
    setError(null)

    startTransition(async () => {
      formData.append('clinic', clinic)
      formData.append('existing_photo_url', pet.photo_url || '')
      if (removePhoto) {
        formData.append('remove_photo', 'true')
      }

      const result = await updatePet(pet.id, formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/${clinic}/portal/pets/${pet.id}`)
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <form action={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="flex justify-center">
          <div className="relative group">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 ${
                preview ? 'border-[var(--primary)]' : 'border-gray-100 bg-gray-50'
              }`}
            >
              {preview ? (
                <img src={preview} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <Icons.Camera className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-white font-bold text-xs ring-2 ring-white px-2 py-1 rounded-full">
                Cambiar
              </span>
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
        {preview && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="w-full text-center text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Eliminar foto
          </button>
        )}
        {!preview && (
          <p className="text-center text-xs text-gray-400">Toca para subir una foto</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Nombre
            </label>
            <input
              name="name"
              required
              type="text"
              defaultValue={pet.name}
              placeholder="Ej: Firulais"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Especie
            </label>
            <select
              name="species"
              defaultValue={pet.species}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white"
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Raza
            </label>
            <input
              name="breed"
              type="text"
              defaultValue={pet.breed || ''}
              placeholder="Ej: Caniche"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Peso (kg)
            </label>
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              defaultValue={pet.weight_kg || ''}
              placeholder="0.0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
            />
          </div>
        </div>

        {/* Physical Specs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Color/Señas
            </label>
            <input
              name="color"
              type="text"
              defaultValue={pet.color || ''}
              placeholder="Ej: Mancha blanca en pecho"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
            />
          </div>
          <div className="flex items-center gap-4 pt-6">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="sex"
                value="male"
                id="male"
                defaultChecked={pet.sex === 'male'}
                className="w-4 h-4 text-[var(--primary)]"
              />
              <label htmlFor="male" className="font-bold text-gray-600">
                Macho
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="sex"
                value="female"
                id="female"
                defaultChecked={pet.sex === 'female'}
                className="w-4 h-4 text-[var(--primary)]"
              />
              <label htmlFor="female" className="font-bold text-gray-600">
                Hembra
              </label>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                name="is_neutered"
                id="neutered"
                defaultChecked={pet.is_neutered}
                className="w-5 h-5 rounded text-[var(--primary)]"
              />
              <label htmlFor="neutered" className="text-sm font-bold text-gray-500">
                Castrado
              </label>
            </div>
          </div>
        </div>

        {/* Health & Behavior */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-[var(--text-primary)]">Salud y Comportamiento</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Temperamento
              </label>
              <select
                name="temperament"
                defaultValue={pet.temperament || 'unknown'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white"
              >
                <option value="unknown">Desconocido</option>
                <option value="friendly">Amigable</option>
                <option value="shy">Tímido/Miedoso</option>
                <option value="aggressive">Agresivo</option>
                <option value="calm">Tranquilo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Alergias
              </label>
              <input
                name="allergies"
                type="text"
                defaultValue={pet.allergies || ''}
                placeholder="Ej: Pollo, Penicilina"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Condiciones Preexistentes
            </label>
            <textarea
              name="existing_conditions"
              defaultValue={pet.existing_conditions || ''}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none resize-none"
              rows={2}
              placeholder="Ej: Hipotiroidismo, Displasia..."
            />
          </div>
        </div>

        {/* Additional Info: Microchip & Diet */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-[var(--text-primary)]">Detalles Adicionales</h3>

          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Microchip / ID
            </label>
            <input
              name="microchip_id"
              type="text"
              defaultValue={pet.microchip_id || ''}
              placeholder="Ej: 9810981098"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Tipo de Dieta
              </label>
              <select
                name="diet_category"
                defaultValue={pet.diet_category || ''}
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
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Notas de Dieta
              </label>
              <input
                name="diet_notes"
                type="text"
                defaultValue={pet.diet_notes || ''}
                placeholder="Ej: Marca Royal Canin, alergia al pollo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {isPending ? (
              <Icons.Loader2 className="animate-spin w-5 h-5" />
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>

        {/* Delete Section */}
        <div className="pt-6 border-t border-gray-100">
          <DeletePetButton petId={pet.id} clinic={clinic} petName={pet.name} />
        </div>
      </form>
    </div>
  )
}
