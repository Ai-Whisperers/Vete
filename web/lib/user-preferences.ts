interface ReminderPreference {
  type: 'email' | 'sms' // Or both, or 'none'
  timeBefore: string // e.g., '24h', '1h', '30m'
  defaultPetId?: string // Default pet for bookings
}

// In a real application, these would interact with a database
const userPreferences: Record<string, ReminderPreference> = {}

export async function setUserReminderPreference(
  userId: string,
  preference: ReminderPreference
): Promise<void> {
  userPreferences[userId] = preference
}

export async function getReminderPreference(
  userId: string
): Promise<ReminderPreference | undefined> {
  return userPreferences[userId]
}
