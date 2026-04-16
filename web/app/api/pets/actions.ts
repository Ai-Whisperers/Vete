import { useServer } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { PetService } from '@/lib/domain/verticals/clinic/pets/service'
import { CreatePetData } from '@/lib/domain/verticals/clinic/pets/types'

export async function GET() {
  const supabase = createClient()
  const petService = new PetService(supabase)

  const pets = await petService.getPets('terrapet')

  return new Response(JSON.stringify(pets), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST({ request }: any) {
  const supabase = createClient()
  const petService = new PetService(supabase)

  const data = await request.json()
  const createPetData: CreatePetData = {
    owner_id: data.owner_id,
    tenant_id: 'terrapet',
    name: data.name,
    species: data.species,
    breed: data.breed,
    birth_date: data.birth_date,
    weight_kg: data.weight_kg,
    microchip_number: data.microchip_number,
    photo_url: data.photo_url,
    sex: data.sex,
    color: data.color,
    is_neutered: data.is_neutered,
    temperament: data.temperament,
    diet_category: data.diet_category,
    diet_notes: data.diet_notes,
    allergies: data.allergies,
    chronic_conditions: data.chronic_conditions,
    notes: data.notes,
  }

  const pet = await petService.createPet(createPetData, 'test-user-id', 'terrapet')

  return new Response(JSON.stringify(pet), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}