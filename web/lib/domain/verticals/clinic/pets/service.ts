import { createClient } from '@/lib/supabase/client'
import { PetRepository } from './repository'
import { Pet, CreatePetData, UpdatePetData } from './types'

export class PetService {
  private repository: PetRepository

  constructor(supabase: any) {
    this.repository = new PetRepository(supabase)
  }

  async getPets(tenantId: string): Promise<Pet[]> {
    return this.repository.findMany(tenantId)
  }

  async getPet(id: string, tenantId: string): Promise<Pet | null> {
    return this.repository.findById(id, tenantId)
  }

  async createPet(data: CreatePetData, userId: string, tenantId: string): Promise<Pet> {
    return this.repository.create(data, userId, tenantId)
  }

  async updatePet(id: string, data: UpdatePetData, userId: string, tenantId: string): Promise<Pet> {
    return this.repository.update(id, data, userId, tenantId)
  }
}