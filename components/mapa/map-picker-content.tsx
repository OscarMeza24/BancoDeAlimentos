"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface MapPickerContentProps {
  initialLocation?: { latitude: number; longitude: number } | null
  onLocationSelect: (coords: { latitude: number; longitude: number }) => void
}

export default function MapPickerContent({ initialLocation, onLocationSelect }: MapPickerContentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("No se pudo obtener la ubicación del usuario:", error)
        }
      )
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Evitar reinicializar si ya existe
    if (mapRef.current) return

    // Si hay ubicación del usuario, usar esa, sino usar la inicial o Quito por defecto
    const startLat = userLocation?.lat || initialLocation?.latitude || -1.831239
    const startLng = userLocation?.lng || initialLocation?.longitude || -78.183406

    try {
      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      // Forzar renderizado del mapa después de que el contenedor tenga dimensiones
      setTimeout(() => {
        map.invalidateSize()
      }, 100)

      // Agregar marcador de ubicación del usuario si existe
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
            <div style="
              background-color: #3b82f6;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("📍 Tu ubicación actual")
      }

      // Agregar marcador inicial si existe
      if (initialLocation) {
        const marker = L.marker([initialLocation.latitude, initialLocation.longitude], {
          draggable: true,
        }).addTo(map)

        marker.on("dragend", () => {
          const pos = marker.getLatLng()
          onLocationSelect({ latitude: pos.lat, longitude: pos.lng })
        })

        markerRef.current = marker
      }

      // Manejar clics en el mapa
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng

        // Remover marcador existente
        if (markerRef.current) {
          markerRef.current.remove()
        }

        // Crear nuevo marcador
        const newMarker = L.marker([lat, lng], {
          draggable: true,
        })
          .addTo(map)
          .bindPopup("📍 Ubicación seleccionada<br><small>Arrastra para ajustar</small>")
          .openPopup()

        newMarker.on("dragend", () => {
          const pos = newMarker.getLatLng()
          onLocationSelect({ latitude: pos.lat, longitude: pos.lng })
        })

        markerRef.current = newMarker
        // Notificar inmediatamente la nueva ubicación
        onLocationSelect({ latitude: lat, longitude: lng })
      }

      map.on("click", handleMapClick)

      return () => {
        map.off("click", handleMapClick)
      }
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }, [userLocation])

  // Actualizar marcador cuando cambia initialLocation
  useEffect(() => {
    if (!mapRef.current || !initialLocation) return

    // Remover marcador existente
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Crear nuevo marcador en la ubicación inicial/actual
    const marker = L.marker([initialLocation.latitude, initialLocation.longitude], {
      draggable: true,
    })
      .addTo(mapRef.current)
      .bindPopup("📍 Ubicación seleccionada<br><small>Arrastra para ajustar</small>")
      .openPopup()

    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      onLocationSelect({ latitude: pos.lat, longitude: pos.lng })
    })

    markerRef.current = marker

    // Centrar mapa en la nueva ubicación
    mapRef.current.setView([initialLocation.latitude, initialLocation.longitude], 15)
  }, [initialLocation])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-96 rounded-lg overflow-hidden"
      style={{
        height: "400px",
        minHeight: "400px",
      }}
    >
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
