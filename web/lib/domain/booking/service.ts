import { BookingRepository } from './repository'
import { VideoConsultationBooking } from './types'

export class BookingService {
  constructor(private repository: BookingRepository) {}

  async bookVideoConsultation(
    data: VideoConsultationBooking,
    userId: string,
    tenantId: string
  ): Promise<any> {
    return this.repository.bookVideoConsultation(data, userId, tenantId)
  }
}

### Server Actions