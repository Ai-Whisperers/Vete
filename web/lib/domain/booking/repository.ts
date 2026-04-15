import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import { BookingSelection, ConsultationType } from './types'

export class BookingRepository {
  constructor(private supabase = createClient()) {}

  async bookVideoConsultation(
    data: VideoConsultationBooking,
    userId: string,
    tenantId: string
  ): Promise<any> {
    const { consultationType, serviceId, petId, date, timeSlot, notes } = data

    // Validate input data
    const validation = z.object({
      consultationType: z.string(),
      serviceId: z.string().nullable(),
      petId: z.string().nullable(),
      date: z.string(),
      timeSlot: z.string(),
      notes: z.string(),
    }).parse(data)

    if (!validation) {
      throw new Error('Invalid booking data')
    }

    // Check if service and pet exist
    const service = await this.getService(serviceId, tenantId)
    const pet = await this.getPet(petId, tenantId)

    if (!service || !pet) {
      throw new Error('Service or pet not found')
    }

    // Book video consultation
    const booking = await this.supabase
      .from('appointments')
      .insert([
        {
          tenant_id: tenantId,
          pet_id: petId,
          vet_id: null,
          start_time: `${date} ${timeSlot}`,
          end_time: `${date} ${timeSlot}`,
          status: 'scheduled',
          reason: notes,
          type: 'video_consultation',
        },
      ])
      .single()

    return booking
  }

  async getService(serviceId: string, tenantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .select('id, name, description')
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      throw new Error('Service not found')
    }

    return data
  }

  async getPet(petId: string, tenantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('pets')
      .select('id, name, species')
      .eq('id', petId)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      throw new Error('Pet not found')
    }

    return data
  }
}

#### Service