'use client'

import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  photo_url?: string
  owner?: {
    id: string
    full_name: string
    phone?: string
    email?: string
  }
}

interface PetSelectorProps {
  pets: Pet[]
  selectedPetId: string | null
  onSelect: (petId: string | null) => void
  disabled?: boolean
}

export function PetSelector({ pets, selectedPetId, onSelect, disabled }: PetSelectorProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredPets = pets.filter(pet => {
    const searchLower = search.toLowerCase()
    return (
      pet.name.toLowerCase().includes(searchLower) ||
      pet.owner?.full_name.toLowerCase().includes(searchLower) ||
      pet.species.toLowerCase().includes(searchLower)
    )
  })

  const selectedPet = pets.find(p => p.id === selectedPetId)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
        Mascota / Cliente *
      </label>
      
      {/* Selected display or search input */}
      {selectedPet && !isOpen ? (
        <div
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[var(--primary)]"
          onClick={() => !disabled && setIsOpen(true)}
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden">
            {selectedPet.photo_url ? (
              <img src={selectedPet.photo_url} alt={selectedPet.name} className="w-full h-full object-cover" />
            ) : (
              <Icons.PawPrint className="w-5 h-5 text-[var(--primary)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{selectedPet.name}</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">
              {selectedPet.owner?.full_name} - {selectedPet.species}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(null); setIsOpen(true) }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar mascota o cliente..."
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredPets.length === 0 ? (
            <div className="p-4 text-center text-[var(--text-secondary)]">
              No se encontraron mascotas
            </div>
          ) : (
            filteredPets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => {
                  onSelect(pet.id)
                  setSearch('')
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden shrink-0">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icons.PawPrint className="w-5 h-5 text-[var(--primary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">{pet.name}</p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {pet.owner?.full_name} • {pet.species}
                    {pet.owner?.phone && ` • ${pet.owner.phone}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="pet_id" value={selectedPetId || ''} />

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
