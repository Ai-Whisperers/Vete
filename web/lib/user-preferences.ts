interface ReminderPreference {
  type: 'email' | 'sms'; // Or both, or 'none'
  timeBefore: string; // e.g., '24h', '1h', '30m'
}

// In a real application, these would interact with a database
const userPreferences: Record<string, ReminderPreference> = {};

export async function setUserReminderPreference(
  userId: string,
  preference: ReminderPreference
): Promise<void> {
  console.log(`Setting reminder preference for user ${userId}:`, preference);
  userPreferences[userId] = preference;
}

export async function getReminderPreference(userId: string): Promise<ReminderPreference | undefined> {
  console.log(`Retrieving reminder preference for user ${userId}`);
  return userPreferences[userId];
}