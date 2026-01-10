"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface MapLocation {
  id: string
  type: "food" | "event" | "organization"
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  status?: string
  date?: string
  data: any
}

interface MapaInteractivoProps {
  locations: MapLocation[]
  selectedLocation: MapLocation | null
  onLocationSelect: (location: MapLocation) => void
  userLocation?: { lat: number; lng: number } | null
}

export default function MapaInteractivo({
  locations,
  selectedLocation,
  onLocationSelect,
  userLocation,
}: MapaInteractivoProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Crear iconos personalizados para cada tipo
  const createCustomIcon = (type: string, isSelected: boolean = false) => {
    let color = "#10b981" // verde para alimentos
    let icon = "🍽️"

    if (type === "event") {
      color = "#3b82f6" // azul para eventos
      icon = "📅"
    } else if (type === "organization") {
      color = "#a855f7" // púrpura para organizaciones
      icon = "🏢"
    }

    const scale = isSelected ? 1.3 : 1

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: ${40 * scale}px;
          height: ${40 * scale}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          ${isSelected ? "animation: bounce 0.5s;" : ""}
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${20 * scale}px;
            display: block;
          ">${icon}</span>
        </div>
      `,
      iconSize: [40 * scale, 40 * scale],
      iconAnchor: [20 * scale, 40 * scale],
      popupAnchor: [0, -40 * scale],
    })
  }

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Crear el mapa centrado en Ecuador (puedes ajustar estas coordenadas)
    const map = L.map(mapContainerRef.current, {
      center: userLocation ? [userLocation.lat, userLocation.lng] : [-1.831239, -78.183406], // Quito, Ecuador por defecto
      zoom: userLocation ? 13 : 12,
      zoomControl: true,
    })

    // Añadir capa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    // Añadir marcador de ubicación del usuario si existe
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: "user-location-marker",
          html: `
            <div style="
              background-color: #ef4444;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map)

      userMarker.bindPopup("<strong>Tu ubicación</strong>")
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLocation])

  // Actualizar marcadores cuando cambien las ubicaciones
  useEffect(() => {
    if (!mapRef.current) return

    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (locations.length === 0) return

    // Añadir nuevos marcadores
    const bounds = L.latLngBounds([])
    
    locations.forEach((location) => {
      const isSelected = selectedLocation?.id === location.id
      const icon = createCustomIcon(location.type, isSelected)

      const marker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(mapRef.current!)
        .on("click", () => {
          onLocationSelect(location)
        })

      // Crear contenido del popup
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
            ${location.type === "food" ? "🍽️" : location.type === "event" ? "📅" : "🏢"} 
            ${location.title}
          </div>
          <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
            ${location.description}
          </div>
          <div style="display: flex; align-items: center; color: #888; font-size: 11px;">
            📍 ${location.address}
          </div>
          ${location.date ? `
            <div style="color: #888; font-size: 11px; margin-top: 4px;">
              📅 ${new Date(location.date).toLocaleDateString()}
            </div>
          ` : ""}
        </div>
      `

      marker.bindPopup(popupContent)

      markersRef.current.push(marker)
      bounds.extend([location.latitude, location.longitude])
    })

    // Incluir la ubicación del usuario en los bounds si existe
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng])
    }

    // Ajustar el mapa para mostrar todos los marcadores
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [locations, selectedLocation, onLocationSelect, userLocation])

  // Centrar en la ubicación seleccionada
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return

    mapRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], 15, {
      animate: true,
      duration: 0.5,
    })

    // Abrir el popup del marcador seleccionado
    const selectedMarker = markersRef.current.find((marker) => {
      const pos = marker.getLatLng()
      return pos.lat === selectedLocation.latitude && pos.lng === selectedLocation.longitude
    })

    if (selectedMarker) {
      selectedMarker.openPopup()
    }
  }, [selectedLocation])

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: "500px" }} />
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) rotate(-45deg);
          }
          50% {
            transform: translateY(-10px) rotate(-45deg);
          }
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </>
  )
}
