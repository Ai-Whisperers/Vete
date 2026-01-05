'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { updatePet } from '@/app/actions/pets'
import { DeletePetButton } from './delete-pet-button'
import { PhotoUpload } from './photo-upload'

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
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)

  const handleFileSelect = useCallback((file: File): void => {
    setSelectedFile(file)
    setRemovePhoto(false)
    setPhotoError(null) // Clear photo error when new file is selected
  }, [])

  const handleFileRemove = useCallback((): void => {
    setSelectedFile(null)
    setRemovePhoto(true)
  }, [])

  async function handleSubmit(formData: FormData): Promise<void> {
    setError(null)
    setPhotoError(null)

    startTransition(async () => {
      formData.append('clinic', clinic)
      formData.append('existing_photo_url', pet.photo_url || '')
      if (removePhoto) {
        formData.append('remove_photo', 'true')
      }
      if (selectedFile) {
        formData.set('photo', selectedFile)
      }

      const result = await updatePet(pet.id, formData)

      if (!result.success) {
        // ERR-001: Distinguish between photo upload errors and general errors
        // Photo upload errors contain "foto" or "subir" keywords
        if (result.error && (result.error.includes('foto') || result.error.includes('subir'))) {
          setPhotoError(result.error)
          // Don't proceed with navigation if photo upload failed
        } else {
          setError(result.error || 'Error al guardar los cambios')
        }
      } else {
        router.push(`/${clinic}/portal/pets/${pet.id}`)
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
      <form action={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-2">
          <PhotoUpload
            name="photo"
            currentPhotoUrl={pet.photo_url || undefined}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            placeholder="Subir foto"
            shape="circle"
            size={128}
            maxSizeMB={5}
          />
          {photoError && (
            <div
              role="alert"
              className="flex max-w-md items-center gap-2 rounded-lg bg-[var(--status-error-bg,#fee2e2)] px-3 py-2 text-xs font-medium text-[var(--status-error,#ef4444)]"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{photoError}</span>
            </div>
          )}
        </div>

        {/* TICKET-FORM-005: Added aria-invalid to form inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pet-name"
              className="mb-1 block text-sm font-bold text-[var(--text-secondary)]"
            >
              Nombre
            </label>
            <input
              id="pet-name"
              name="name"
              required
              type="text"
              defaultValue={pet.name}
              placeholder="Ej: Firulais"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'pet-error' : undefined}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="pet-species"
              className="mb-1 block text-sm font-bold text-[var(--text-secondary)]"
            >
              Especie
            </label>
            <select
              id="pet-species"
              name="species"
              defaultValue={pet.species}
              aria-invalid="false"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pet-breed"
              className="mb-1 block text-sm font-bold text-[var(--text-secondary)]"
            >
              Raza
            </label>
            <input
              id="pet-breed"
              name="breed"
              type="text"
              defaultValue={pet.breed || ''}
              placeholder="Ej: Caniche"
              aria-invalid="false"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="pet-weight"
              className="mb-1 block text-sm font-bold text-[var(--text-secondary)]"
            >
              Peso (kg)
            </label>
            <input
              id="pet-weight"
              name="weight_kg"
              type="number"
              step="0.1"
              defaultValue={pet.weight_kg || ''}
              placeholder="0.0"
              aria-invalid="false"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Physical Specs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
              Color/Señas
            </label>
            <input
              name="color"
              type="text"
              defaultValue={pet.color || ''}
              placeholder="Ej: Mancha blanca en pecho"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
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
                className="h-4 w-4 text-[var(--primary)]"
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
                className="h-4 w-4 text-[var(--primary)]"
              />
              <label htmlFor="female" className="font-bold text-gray-600">
                Hembra
              </label>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="is_neutered"
                id="neutered"
                defaultChecked={pet.is_neutered}
                className="h-5 w-5 rounded text-[var(--primary)]"
              />
              <label htmlFor="neutered" className="text-sm font-bold text-gray-500">
                Castrado
              </label>
            </div>
          </div>
        </div>

        {/* Health & Behavior */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h3 className="font-bold text-[var(--text-primary)]">Salud y Comportamiento</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
                Temperamento
              </label>
              <select
                name="temperament"
                defaultValue={pet.temperament || 'unknown'}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
              >
                <option value="unknown">Desconocido</option>
                <option value="friendly">Amigable</option>
                <option value="shy">Tímido/Miedoso</option>
                <option value="aggressive">Agresivo</option>
                <option value="calm">Tranquilo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
                Alergias
              </label>
              <input
                name="allergies"
                type="text"
                defaultValue={pet.allergies || ''}
                placeholder="Ej: Pollo, Penicilina"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
              Condiciones Preexistentes
            </label>
            <textarea
              name="existing_conditions"
              defaultValue={pet.existing_conditions || ''}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
              rows={2}
              placeholder="Ej: Hipotiroidismo, Displasia..."
            />
          </div>
        </div>

        {/* Additional Info: Microchip & Diet */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h3 className="font-bold text-[var(--text-primary)]">Detalles Adicionales</h3>

          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
              Microchip / ID
            </label>
            <input
              name="microchip_id"
              type="text"
              defaultValue={pet.microchip_id || ''}
              placeholder="Ej: 9810981098"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
                Tipo de Dieta
              </label>
              <select
                name="diet_category"
                defaultValue={pet.diet_category || ''}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
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
              <label className="mb-1 block text-sm font-bold text-[var(--text-secondary)]">
                Notas de Dieta
              </label>
              <input
                name="diet_notes"
                type="text"
                defaultValue={pet.diet_notes || ''}
                placeholder="Ej: Marca Royal Canin, alergia al pollo"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* TICKET-FORM-005: Added proper error alert with ID */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            id="pet-error"
            className="flex items-center gap-2 rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error)]"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Cambios'}
          </button>
        </div>

        {/* Delete Section */}
        <div className="border-t border-gray-100 pt-6">
          <DeletePetButton petId={pet.id} clinic={clinic} petName={pet.name} />
        </div>
      </form>
    </div>
  )
}
