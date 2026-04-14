import { useServer } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RewardService } from '@/lib/domain/rewards/service';

export async function GET() {
  const supabase = createClient('anon');
  const rewardService = new RewardService(supabase);

  const rewards = await rewardService.getRewards({}, 'tenant-id');

  return new Response(JSON.stringify(rewards), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ request }) {
  const supabase = createClient('anon');
  const rewardService = new RewardService(supabase);

  const data = await request.json();
  const reward = await rewardService.createReward(data, 'user-id', 'tenant-id');

  return new Response(JSON.stringify(reward), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

### API Routes