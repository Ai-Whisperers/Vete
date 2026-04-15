import L from 'leaflet'

interface MarkerProps {
  position: { lat: number; lng: number }
}

export function Marker({ position }: MarkerProps) {
  const marker = L.marker([position.lat, position.lng])

  return <>{marker.addTo(L.map('map'))}</>
}