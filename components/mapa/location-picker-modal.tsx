"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, MapPin } from "lucide-react"

interface LocationPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void
  initialLocation?: { latitude: number; longitude: number } | null
}

// Componente del mapa con carga dinámica
const MapContainer = dynamic(() => import("./map-picker-content"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
})

export default function LocationPickerModal({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}: LocationPickerModalProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  // Pedir ubicación del usuario al abrir el modal
  useEffect(() => {
    if (open && !selectedCoords && navigator.geolocation) {
      setGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGettingLocation(false)
        },
        (error) => {
          console.log("No se pudo obtener la ubicación:", error)
          setGettingLocation(false)
        }
      )
    }
  }, [open])

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          alert("No se pudo obtener tu ubicación. Por favor, verifica los permisos del navegador.")
          setGettingLocation(false)
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
    }
  }

  const handleLocationSelect = async (coords: { latitude: number; longitude: number }) => {
    // Solo actualizar las coordenadas, no cerrar el modal aún
    setSelectedCoords(coords)
  }

  const handleConfirm = async () => {
    if (!selectedCoords) {
      return
    }

    setIsLoading(true)

    try {
      // Obtener la dirección usando geocodificación inversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedCoords.latitude}&lon=${selectedCoords.longitude}`
      )
      const data = await response.json()
      const address = data.display_name || `${selectedCoords.latitude.toFixed(4)}, ${selectedCoords.longitude.toFixed(4)}`

      onLocationSelect({
        latitude: selectedCoords.latitude,
        longitude: selectedCoords.longitude,
        address,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error obtaining address:", error)
      // Si falla la geocodificación, usar coordenadas como dirección
      onLocationSelect({
        latitude: selectedCoords.latitude,
        longitude: selectedCoords.longitude,
        address: `${selectedCoords.latitude.toFixed(4)}, ${selectedCoords.longitude.toFixed(4)}`,
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar ubicación de recogida</DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-2 text-sm mt-2">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>Haz clic en el mapa para seleccionar la ubicación o arrastra el marcador para ajustarlo</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={gettingLocation}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              {gettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
            </Button>
          </div>

          <div className="w-full rounded-lg overflow-hidden" style={{ minHeight: "400px" }}>
            <MapContainer initialLocation={selectedCoords} onLocationSelect={handleLocationSelect} />
          </div>

          {selectedCoords ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong>Coordenadas seleccionadas:</strong> {selectedCoords.latitude.toFixed(6)}, 
                {selectedCoords.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-amber-600">👆</span>
                <span>Haz clic en el mapa para seleccionar una ubicación</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedCoords || isLoading}
            >
              {isLoading ? "Obteniendo dirección..." : "Confirmar ubicación"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
