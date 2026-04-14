import { supabaseClient } from '../lib/supabase';

interface DataRetentionPolicy {
  retentionPeriod: number; // in days
  cleanupInterval: number; // in hours
}

const dataRetentionPolicies: { [key: string]: DataRetentionPolicy } = {
  // Define retention periods for different types of data
  appointments: { retentionPeriod: 365, cleanupInterval: 24 },
  invoices: { retentionPeriod: 730, cleanupInterval: 24 },
  conversations: { retentionPeriod: 180, cleanupInterval: 12 },
};

async function cleanupData(type: string) {
  const policy = dataRetentionPolicies[type];
  if (!policy) {
    console.error(`No data retention policy found for ${type}`);
    return;
  }

  const { data, error } = await supabaseClient
    .from(type)
    .select('id')
    .lt('created_at', new Date(Date.now() - policy.retentionPeriod * 24 * 60 * 60 * 1000));

  if (error) {
    console.error(`Error cleaning up ${type} data: ${error.message}`);
    return;
  }

  if (data) {
    await supabaseClient.from(type).delete().in('id', data.map((item) => item.id));
    console.log(`Cleaned up ${data.length} ${type} records`);
  }
}

async function scheduleCleanup() {
  // Schedule cleanup tasks for each data type
  Object.keys(dataRetentionPolicies).forEach((type) => {
    const policy = dataRetentionPolicies[type];
    const interval = policy.cleanupInterval * 60 * 60 * 1000; // convert hours to milliseconds
    setInterval(() => cleanupData(type), interval);
  });
}

export { scheduleCleanup };