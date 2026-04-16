import { z } from 'zod'

export enum PetSpecies {
  Dog = 'dog',
  Cat = 'cat',
  Bird = 'bird',
  Rabbit = 'rabbit',
  Hamster = 'hamster',
  Fish = 'fish',
  Reptile = 'reptile',
  Other = 'other',
}

export enum PetSex {
  Male = 'male',
  Female = 'female',
  Unknown = 'unknown',
}

export interface Pet {
  id: string
  owner_id: string
  tenant_id: string
  name: string
  species: PetSpecies
  breed: string
  birth_date: string
  weight_kg: number
  microchip_number: string | null
  photo_url: string | null
  sex: PetSex
  color: string
  is_neutered: boolean
  temperament: string
  diet_category: string | null
  diet_notes: string | null
  allergies: string[] | null
  chronic_conditions: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreatePetData {
  owner_id: string
  tenant_id: string
  name: string
  species: PetSpecies
  breed: string
  birth_date: string
  weight_kg: number
  microchip_number: string | null
  photo_url: string | null
  sex: PetSex
  color: string
  is_neutered: boolean
  temperament: string
  diet_category: string | null
  diet_notes: string | null
  allergies: string[] | null
  chronic_conditions: string[] | null
  notes: string | null
}

export interface UpdatePetData {
  name?: string
  breed?: string
  birth_date?: string
  weight_kg?: number
  microchip_number?: string | null
  photo_url?: string | null
  sex?: PetSex
  color?: string
  is_neutered?: boolean
  temperament?: string
  diet_category?: string | null
  diet_notes?: string | null
  allergies?: string[] | null
  chronic_conditions?: string[] | null
  notes?: string | null
}

export const PetSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  species: z.nativeEnum(PetSpecies),
  breed: z.string(),
  birth_date: z.string(),
  weight_kg: z.number(),
  microchip_number: z.string().nullish(),
  photo_url: z.string().nullish(),
  sex: z.nativeEnum(PetSex),
  color: z.string(),
  is_neutered: z.boolean(),
  temperament: z.string(),
  diet_category: z.string().nullish(),
  diet_notes: z.string().nullish(),
  allergies: z.array(z.string()).nullish(),
  chronic_conditions: z.array(z.string()).nullish(),
  notes: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CreatePetSchema = z.object({
  owner_id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  species: z.nativeEnum(PetSpecies),
  breed: z.string(),
  birth_date: z.string(),
  weight_kg: z.number(),
  microchip_number: z.string().nullish(),
  photo_url: z.string().nullish(),
  sex: z.nativeEnum(PetSex),
  color: z.string(),
  is_neutered: z.boolean(),
  temperament: z.string(),
  diet_category: z.string().nullish(),
  diet_notes: z.string().nullish(),
  allergies: z.array(z.string()).nullish(),
  chronic_conditions: z.array(z.string()).nullish(),
  notes: z.string().nullish(),
})

export const UpdatePetSchema = z.object({
  name: z.string().optional(),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  weight_kg: z.number().optional(),
  microchip_number: z.string().nullish().optional(),
  photo_url: z.string().nullish().optional(),
  sex: z.nativeEnum(PetSex).optional(),
  color: z.string().optional(),
  is_neutered: z.boolean().optional(),
  temperament: z.string().optional(),
  diet_category: z.string().nullish().optional(),
  diet_notes: z.string().nullish().optional(),
  allergies: z.array(z.string()).nullish().optional(),
  chronic_conditions: z.array(z.string()).nullish().optional(),
  notes: z.string().nullish().optional(),
})