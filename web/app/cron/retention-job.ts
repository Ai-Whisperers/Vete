import { runRetentionJob } from '@/lib/data/retention-job'

export async function retentionJob(): Promise<void> {
  await runRetentionJob()
}

Note: The above files are just examples and may need to be modified to fit your specific use case. Additionally, you will need to configure the cron job to run the `retentionJob` function periodically.