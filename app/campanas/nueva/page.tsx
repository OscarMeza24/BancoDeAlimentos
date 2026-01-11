"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, DollarSign, ArrowLeft, MapPin } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { sendNotification } from "@/lib/notifications"
import type { Profile } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import LocationPickerModal from "@/components/mapa/location-picker-modal"

export default function NuevaCampanaPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "activa" as "activa" | "pausada" | "completada" | "cancelada",
    category: "alimentos",
    target_organization: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      // Verificar permisos
      if (profileData?.role !== "administrador") {
        toast({
          title: "Sin permisos",
          description: "Solo administradores pueden crear campañas",
          variant: "destructive",
        })
        router.push("/campanas")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/campanas")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!profile) {
        throw new Error("Debes iniciar sesión para crear campañas")
      }

      // Validaciones
      if (!formData.title.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (formData.goal_amount && parseFloat(formData.goal_amount) <= 0) {
        throw new Error("La meta debe ser mayor a 0")
      }

      // Validar fechas
      if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio")
      }

      // Crear campaña
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: formData.title,
          description: formData.description || null,
          goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
          current_amount: 0,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          status: formData.status,
          category: formData.category,
          target_organization: formData.target_organization || null,
          latitude: selectedLocation?.latitude || null,
          longitude: selectedLocation?.longitude || null,
          location: selectedLocation?.address || null,
          created_by: profile.id,
        })
        .select()
        .single()

      if (error) throw error

      // Send notification to all users about the new campaign
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", profile.id)

      if (allUsers && allUsers.length > 0) {
        for (const user of allUsers) {
          await sendNotification(
            user.id,
            {
              title: `Nueva campaña: ${formData.title}`,
              message: formData.description || "Una nueva campaña ha sido creada",
              type: "campana",
              action_url: `/campanas/${data.id}`,
            }
          )
        }
      }

      toast({
        title: "¡Campaña creada exitosamente!",
        description: "La campaña ha sido publicada",
      })

      router.push("/campanas")
    } catch (error: any) {
      toast({
        title: "Error al crear campaña",
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
            <Link href="/campanas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campañas
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Campaña</h1>
          <p className="text-gray-600 mt-2">Organiza una campaña de recaudación para tu comunidad</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Campaña</CardTitle>
            <CardDescription>Completa los detalles de la campaña que deseas crear</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título de la Campaña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Apoyo Alimentario Navideño"
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
                  placeholder="Describe el propósito de la campaña, cómo se usarán los fondos, etc."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Categoría y Meta de recaudación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alimentos">Alimentos</SelectItem>
                      <SelectItem value="emergencia">Emergencia</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_amount">Meta de Recaudación (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="goal_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="5000.00"
                      value={formData.goal_amount}
                      onChange={(e) => handleChange("goal_amount", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Deja vacío si no hay meta específica</p>
                </div>
              </div>

              {/* Organización Destinataria */}
              <div className="space-y-2">
                <Label htmlFor="target_organization">Organización Destinataria</Label>
                <Input
                  id="target_organization"
                  placeholder="Nombre de la organización beneficiada"
                  value={formData.target_organization}
                  onChange={(e) => handleChange("target_organization", e.target.value)}
                />
              </div>

              {/* Ubicación en el Mapa */}
              <div className="space-y-2">
                <Label>Ubicación en el Mapa</Label>
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

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Opcional</p>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado de la Campaña</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creando campaña..." : "Crear Campaña"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/campanas")} disabled={loading}>
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
          initialLocation={selectedLocation}
        />
      </div>
    </div>
  )
}
