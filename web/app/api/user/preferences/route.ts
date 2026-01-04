import { NextResponse } from 'next/server'
import { getReminderPreference, setUserReminderPreference } from '@/lib/user-preferences'

// Mock function to simulate getting user-specific data from a session or DB
// In a real app, this would get the actual authenticated user ID
function getAuthenticatedUserId(): string {
  return 'mock-user-123'
}

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId()
  const userPref = await getReminderPreference(userId) // Re-using for general preferences
  return NextResponse.json(userPref, { status: 200 })
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId()
  const body = await request.json()

  const { defaultPetId, reminderType, reminderTimeBefore } = body

  let currentPreferences = await getReminderPreference(userId)
  if (!currentPreferences) {
    currentPreferences = {
      defaultPetId: undefined,
      type: 'email', // Default
      timeBefore: '24h', // Default
    }
  }

  const updatedPreferences: any = { ...currentPreferences }

  if (defaultPetId !== undefined) {
    updatedPreferences.defaultPetId = defaultPetId
  }
  if (reminderType !== undefined) {
    updatedPreferences.type = reminderType
  }
  if (reminderTimeBefore !== undefined) {
    updatedPreferences.timeBefore = reminderTimeBefore
  }

  await setUserReminderPreference(userId, updatedPreferences)

  return NextResponse.json({ success: true, preferences: updatedPreferences }, { status: 200 })
}
