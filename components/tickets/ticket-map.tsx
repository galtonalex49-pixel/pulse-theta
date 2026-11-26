'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PIN_HTML = `
<svg width="38" height="50" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M18 1C8.6 1 1 8.6 1 18c0 12.5 17 27 17 27s17-14.5 17-27C35 8.6 27.4 1 18 1z" fill="#0052e6" stroke="#ffffff" stroke-width="2"/>
  <circle cx="18" cy="18" r="6.5" fill="#ffffff"/>
</svg>`

interface TicketMapProps {
  lat: number
  lng: number
  name: string
}

export default function TicketMap({ lat, lng, name }: TicketMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      attributionControl: true,
    })
    map.attributionControl.setPrefix(false)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const icon = L.divIcon({
      html: PIN_HTML,
      className: '',
      iconSize: [38, 50],
      iconAnchor: [19, 50],
    })
    L.marker([lat, lng], { icon, title: name, alt: name }).addTo(map)

    return () => {
      map.remove()
    }
  }, [lat, lng, name])

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label={`Map of ${name}`} />
}
