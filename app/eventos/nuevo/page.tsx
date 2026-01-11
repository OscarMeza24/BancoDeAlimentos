"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import LocationPickerModal from "@/components/mapa/location-picker-modal"

export default function NuevoEventoPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_volunteers: "",
    status: "programado" as "programado" | "en_curso" | "completado" | "cancelado",
    category: "general" as string,
    required_materials: "",
    meeting_point: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      // Verificar permisos
      if (profileData?.role !== "administrador" && profileData?.role !== "voluntario") {
        toast({
          title: "Sin permisos",
          description: "Solo administradores y voluntarios pueden crear eventos",
          variant: "destructive",
        })
        router.push("/eventos")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/eventos")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!profile) {
        throw new Error("Debes iniciar sesión para crear eventos")
      }

      // Validaciones
      if (!formData.title.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (!formData.event_date) {
        throw new Error("La fecha del evento es obligatoria")
      }

      // Verificar que la fecha no sea pasada
      if (new Date(formData.event_date) < new Date()) {
        throw new Error("La fecha del evento no puede ser en el pasado")
      }

      if (!selectedLocation) {
        throw new Error("Debes seleccionar una ubicación en el mapa")
      }

      // Crear evento
      const { data, error } = await supabase
        .from("volunteer_events")
        .insert({
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date,
          location: selectedLocation.address,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : null,
          registered_volunteers: 0,
          status: formData.status,
          created_by: profile.id,
          category: formData.category,
          required_materials: formData.required_materials || null,
          meeting_point: formData.meeting_point || null,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "¡Evento creado exitosamente!",
        description: "El evento ha sido publicado",
      })

      router.push("/eventos")
    } catch (error: any) {
      toast({
        title: "Error al crear evento",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/eventos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Evento</h1>
          <p className="text-gray-600 mt-2">Organiza un evento de voluntariado para tu comunidad</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
            <CardDescription>
              Completa los detalles del evento de voluntariado que deseas crear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título del Evento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Jornada de Recolección de Alimentos"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el evento, actividades a realizar, qué deben llevar los voluntarios, etc."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría del Evento</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="recoleccion">Recolección</SelectItem>
                    <SelectItem value="distribucion">Distribución</SelectItem>
                    <SelectItem value="capacitacion">Capacitación</SelectItem>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y hora */}
              <div className="space-y-2">
                <Label htmlFor="event_date">
                  Fecha y Hora <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => handleChange("event_date", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Ubicación en Mapa */}
              <div className="space-y-2">
                <Label>
                  Ubicación en el Mapa <span className="text-red-500">*</span>
                </Label>
                <div className="border rounded-lg p-3 bg-gray-50">
                  {selectedLocation ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{selectedLocation.address}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Lat: {selectedLocation.latitude.toFixed(6)}, Long: {selectedLocation.longitude.toFixed(6)}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLocationPicker(true)}
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Cambiar ubicación
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Seleccionar ubicación en el mapa
                    </Button>
                  )}
                </div>
              </div>

              {/* Punto de encuentro */}
              <div className="space-y-2">
                <Label htmlFor="meeting_point">Punto de Encuentro / Referencia</Label>
                <Input
                  id="meeting_point"
                  placeholder="Ej: Esquina con la tienda de abarrotes"
                  value={formData.meeting_point}
                  onChange={(e) => handleChange("meeting_point", e.target.value)}
                />
              </div>

              {/* Materiales Requeridos */}
              <div className="space-y-2">
                <Label htmlFor="required_materials">Materiales Requeridos</Label>
                <Textarea
                  id="required_materials"
                  placeholder="Ej: Bolsas plásticas, guantes, gorras, botellas de agua, etc."
                  value={formData.required_materials}
                  onChange={(e) => handleChange("required_materials", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Máximo de voluntarios */}
              <div className="space-y-2">
                <Label htmlFor="max_volunteers">Máximo de Voluntarios</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="max_volunteers"
                    type="number"
                    min="1"
                    placeholder="Dejar vacío para sin límite"
                    value={formData.max_volunteers}
                    onChange={(e) => handleChange("max_volunteers", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500">Deja vacío si no hay límite de voluntarios</p>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado del Evento</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programado">Programado</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creando evento..." : "Crear Evento"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/eventos")} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Location Picker Modal */}
        <LocationPickerModal
          open={showLocationPicker}
          onOpenChange={setShowLocationPicker}
          onLocationSelect={(location) => {
            setSelectedLocation(location)
            setShowLocationPicker(false)
          }}
          initialLocation={selectedLocation ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude } : null}
        />
      </div>
    </div>
  )
}
