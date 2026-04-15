// ... existing actions

export const sendReminders = withActionAuth(
  async ({ user, profile, supabase }, tenantId: string) => {
    try {
      const reminderService = new ReminderService(supabase)
      await reminderService.sendReminders(tenantId)

      return actionSuccess(null, 'Recordatorios enviados correctamente')
    } catch (error: unknown) {
      return handleActionError(error, {
        userId: user.id,
        tenantId: profile.tenant_id,
        operation: 'send_reminders',
      })
    }
  },
  { roles: ['admin', 'practitioner'] }
)