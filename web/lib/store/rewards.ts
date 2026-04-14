import create from 'zustand';
import { Reward } from '@/lib/domain/rewards/types';

interface RewardStore {
  rewards: Reward[];
  getRewards: () => void;
}

const useRewardStore = create<RewardStore>()((set, get) => ({
  rewards: [],
  getRewards: async () => {
    const response = await fetch('/api/rewards');
    const rewards: Reward[] = await response.json();
    set({ rewards });
  },
}));

export default useRewardStore;

### Components