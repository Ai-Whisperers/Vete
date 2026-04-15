import { ClaimRepository } from './repository';
import { Claim, CreateClaimData, UpdateClaimData } from './types';

export class ClaimService {
  private repository: ClaimRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new ClaimRepository(supabase);
  }

  async createClaim(data: CreateClaimData, userId: string, tenantId: string): Promise<Claim> {
    return this.repository.createClaim(data, userId, tenantId);
  }

  async updateClaim(id: string, data: UpdateClaimData, userId: string, tenantId: string): Promise<Claim> {
    return this.repository.updateClaim(id, data, userId, tenantId);
  }

  async getClaim(id: string, tenantId: string): Promise<Claim | null> {
    return this.repository.getClaim(id, tenantId);
  }
}

#### Server Actions