import { useServer } from 'next/server'
import { BookingService } from '../../../lib/domain/booking/service'

export async function POST({ request }) {
  const { consultationType, serviceId, petId, date, timeSlot, notes } = await request.json()

  const bookingService = new BookingService(new BookingRepository())

  try {
    const booking = await bookingService.bookVideoConsultation(
      {
        consultationType,
        serviceId,
        petId,
        date,
        timeSlot,
        notes,
      },
      'owner-id', // Replace with actual user ID
      'tenant-id' // Replace with actual tenant ID
    )

    return new Response(JSON.stringify(booking), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to book video consultation' }), {
      status: 500,
    })
  }
}

### Components