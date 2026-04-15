// ... existing repository methods

export class ReminderRepository {
  // ... existing methods

  async createReminder(tenantId: string, input: CreateReminderInput): Promise<Reminder> {
    const { data, error } = await this.supabase
      .from('reminders')
      .insert({
        tenant_id: tenantId,
        client_id: input.client_id,
        pet_id: input.pet_id,
        type: input.type,
        reference_type: input.reference_type,
        reference_id: input.reference_id,
        scheduled_at: input.scheduled_at,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        custom_subject: input.custom_subject,
        custom_body: input.custom_body,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear recordatorio: ${error.message}`)
    return data as Reminder
  }

  async updateReminder(tenantId: string, id: string, updates: UpdateReminderInput): Promise<Reminder> {
    const { data, error } = await this.supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar recordatorio: ${error.message}`)
    return data as Reminder
  }

  async findReminders(
    tenantId: string,
    filters: ReminderFilters = {}
  ): Promise<ReminderWithRelations[]> {
    let query = this.supabase
      .from('reminders')
      .select(
        `
        *,
        client:profiles!client_id(id, full_name, email, phone),
        pet:pets(id, name, species)
      `
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters.pet_id) {
      query = query.eq('pet_id', filters.pet_id)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.from_date) {
      query = query.gte('scheduled_at', filters.from_date)
    }

    if (filters.to_date) {
      query = query.lte('scheduled_at', filters.to_date)
    }

    if (filters.pending_only) {
      query = query.eq('status', 'pending')
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al cargar recordatorios: ${error.message}`)
    return (data || []) as ReminderWithRelations[]
  }
}