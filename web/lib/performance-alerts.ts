import { createClient } from '@/lib/supabase/client'
import { sendAlert } from '@/lib/utils'

const supabase = createClient()

export async function sendPerformanceAlert(regression: any) {
  const message = `Performance regression detected: ${regression}`
  await sendAlert(message)
}