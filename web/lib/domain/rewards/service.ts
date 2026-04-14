import { RewardRepository } from './repository';
import { Reward, Redemption, CreateRedemptionData } from './types';

export class RewardService {
  private repository: RewardRepository;

  constructor(supabase: any) {
    this.repository = new RewardRepository(supabase);
  }

  async getRewards(filters: any = {}, tenantId: string): Promise<Reward[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async getReward(id: string, tenantId: string): Promise<Reward | null> {
    return this.repository.findById(id, tenantId);
  }

  async createReward(data: any, userId: string, tenantId: string): Promise<Reward> {
    return this.repository.create(data, userId, tenantId);
  }

  async redeemReward(rewardId: string, userId: string, tenantId: string): Promise<Redemption> {
    return this.repository.redeem(rewardId, userId, tenantId);
  }
}

### Server Actions