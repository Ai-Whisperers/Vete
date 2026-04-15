// ... existing functions

export const sendReminders = inngest.createFunction(
  {
    id: 'reminders-send',
    name: 'Send Reminders',
    retries: 2,
    concurrency: { limit: 1 },
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const supabase = await createClient('service_role')

    const reminders = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })

    for (const reminder of reminders) {
      try {
        // Send reminder using notification service
        await step.run('send-reminder', async () => {
          await sendReminder(reminder)
        })

        // Update reminder status
        await supabase
          .from('reminders')
          .update({ status: 'sent' })
          .eq('id', reminder.id)
      } catch (error: unknown) {
        logger.error('[Inngest] Error sending reminder', {
          reminderId: reminder.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true }
  }
)

async function sendReminder(reminder: Reminder): Promise<void> {
  // Send reminder using notification service
  const notificationService = new NotificationService(supabase)
  await notificationService.sendNotification(reminder)
}