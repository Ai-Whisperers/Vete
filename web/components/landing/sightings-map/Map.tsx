import { useState, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  center: { lat: number; lng: number }
  zoom: number
  children: React.ReactNode
}

export function Map({ center, zoom, children }: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null)

  useEffect(() => {
    if (!map) {
      const mapInstance = L.map('map').setView([center.lat, center.lng], zoom)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(mapInstance)
      setMap(mapInstance)
    }
  }, [map, center, zoom])

  return (
    <div id="map" style={{ height: '500px', width: '100%' }}>
      {children}
    </div>
  )
}