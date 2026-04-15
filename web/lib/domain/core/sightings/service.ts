import { SightingRepository } from './repository'
import { Sighting, CreateSightingData, UpdateSightingData, SightingFilters } from './types'

export class SightingService {
  private repository: SightingRepository

  constructor() {
    this.repository = new SightingRepository()
  }

  async createSighting(data: CreateSightingData, userId: string, tenantId: string): Promise<Sighting> {
    return this.repository.create(data, userId, tenantId)
  }

  async updateSighting(id: string, data: UpdateSightingData, userId: string, tenantId: string): Promise<Sighting> {
    return this.repository.update(id, data, userId, tenantId)
  }

  async getSightings(filters: SightingFilters = {}, tenantId: string): Promise<Sighting[]> {
    return this.repository.findMany(filters, tenantId)
  }
}