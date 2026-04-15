// ... existing service methods

export class ReminderService {
  // ... existing methods

  async createReminder(tenantId: string, input: CreateReminderInput): Promise<Reminder> {
    if (!input.client_id || !input.type || !input.scheduled_at) {
      throw new Error('Campos requeridos: client_id, type, scheduled_at')
    }

    const reminder = await this.repository.createReminder(tenantId, input)

    logger.info('[ReminderService] Reminder created', {
      reminderId: reminder.id,
      type: input.type,
      scheduledAt: input.scheduled_at,
    })

    return reminder
  }

  async updateReminder(tenantId: string, id: string, updates: UpdateReminderInput): Promise<Reminder> {
    const existing = await this.repository.findReminderById(id, tenantId)
    if (!existing) {
      throw new Error('Recordatorio no encontrado')
    }

    const reminder = await this.repository.updateReminder(tenantId, id, updates)

    logger.info('[ReminderService] Reminder updated', {
      reminderId: id,
    })

    return reminder
  }

  async sendReminders(tenantId: string): Promise<void> {
    const reminders = await this.repository.findReminders(tenantId, { pending_only: true })

    for (const reminder of reminders) {
      try {
        // Send reminder using notification service
        await this.notificationService.sendNotification(reminder)

        // Update reminder status
        await this.repository.updateReminder(tenantId, reminder.id, { status: 'sent' })
      } catch (error: unknown) {
        logger.error('[ReminderService] Error sending reminder', {
          reminderId: reminder.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }
}