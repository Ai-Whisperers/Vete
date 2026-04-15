import { useState, useEffect } from 'react'
import { Sighting } from '@/lib/domain/core/sightings/types'

interface SightingsMapProps {
  sightings: Sighting[]
}

export function SightingsMap({ sightings }: SightingsMapProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })
  const [zoom, setZoom] = useState(12)

  useEffect(() => {
    if (sightings.length > 0) {
      const center = sightings[0].location
      setMapCenter(center)
    }
  }, [sightings])

  return (
    <div>
      <h1>Sightings Map</h1>
      <div>
        <Map center={mapCenter} zoom={zoom}>
          {sightings.map((sighting) => (
            <Marker key={sighting.id} position={sighting.location} />
          ))}
        </Map>
      </div>
    </div>
  )
}