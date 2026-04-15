import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function sendAlert(message: string) {
  // Implement alert sending logic here
  // For example, using a notification service or email
  console.log(`Sending alert: ${message}`)
}