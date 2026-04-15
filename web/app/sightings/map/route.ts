import { SightingService } from '@/lib/domain/core/sightings/service'

export async function GET() {
  const service = new SightingService()
  const sightings = await service.getSightings({}, 'tenant-id')

  return new Response(JSON.stringify(sightings), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}