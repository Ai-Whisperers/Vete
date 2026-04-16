import { createClient } from '@/lib/supabase/server'
import { getActiveRetentionPolicies } from './retention-config'

export async function runRetentionJob(): Promise<void> {
  const client = createClient()
  const policies = getActiveRetentionPolicies()

  for (const policy of policies) {
    await processRetentionPolicy(client, policy)
  }
}

async function processRetentionPolicy(client: any, policy: any): Promise<void> {
  const { data, error } = await client
    .from(policy.table)
    .delete()
    .lt(policy.dateColumn, policy.retentionPeriod)

  if (error) {
    console.error(`Error processing policy ${policy.table}: ${error.message}`)
  } else {
    console.log(`Processed policy ${policy.table}: ${data.length} records deleted`)
  }
}

#### 3. Supabase Configuration

We need to configure Supabase to run the data retention job periodically.