"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Filter, Navigation, Heart, Users, Calendar } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

// Importación dinámica del mapa para evitar problemas con SSR
const MapaInteractivo = dynamic(() => import("@/components/mapa/mapa-interactivo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  ),
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

export default function MapaPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    loadData()
    getUserLocation()
  }, [])

  useEffect(() => {
    filterLocations()
  }, [searchTerm, typeFilter, locations])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await Promise.all([loadFoodLocations(), loadEventLocations(), loadOrganizations()])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del mapa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadFoodLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("food_items")
        .select(`
          *,
          category:food_categories(name, icon),
          donor:profiles(full_name, city)
        `)
        .eq("status", "disponible")
        .not("pickup_latitude", "is", null)
        .not("pickup_longitude", "is", null)

      if (error) throw error

      const foodLocations: MapLocation[] = (data || []).map((item) => ({
        id: item.id,
        type: "food",
        title: item.name,
        description: `${item.quantity} ${item.unit} - ${item.category?.name || "Sin categoría"}`,
        latitude: item.pickup_latitude!,
        longitude: item.pickup_longitude!,
        address: item.pickup_location || "",
        status: item.status,
        data: item,
      }))

      setLocations((prev) => [...prev, ...foodLocations])
    } catch (error) {
      console.error("Error loading food locations:", error)
    }
  }

  const loadEventLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteer_events")
        .select("*")
        .eq("status", "programado")
        .gte("event_date", new Date().toISOString())
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error

      const eventLocations: MapLocation[] = (data || []).map((event) => ({
        id: event.id,
        type: "event",
        title: event.title,
        description: event.description || "",
        latitude: event.latitude!,
        longitude: event.longitude!,
        address: event.location || "",
        date: event.event_date,
        data: event,
      }))

      setLocations((prev) => [...prev, ...eventLocations])
    } catch (error) {
      console.error("Error loading event locations:", error)
    }
  }

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "beneficiario")
        .not("organization_name", "is", null)
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error

      const orgLocations: MapLocation[] = (data || []).map((org) => ({
        id: org.id,
        type: "organization",
        title: org.organization_name!,
        description: org.organization_type || "Organización beneficiaria",
        latitude: org.latitude!,
        longitude: org.longitude!,
        address: org.address || "",
        data: org,
      }))

      setLocations((prev) => [...prev, ...orgLocations])
    } catch (error) {
      console.error("Error loading organizations:", error)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    }
  }

  const filterLocations = () => {
    let filtered = locations

    if (searchTerm) {
      filtered = filtered.filter(
        (location) =>
          location.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((location) => location.type === typeFilter)
    }

    setFilteredLocations(filtered)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "food":
        return "🍽️"
      case "event":
        return "📅"
      case "organization":
        return "🏢"
      default:
        return "📍"
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case "food":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-blue-100 text-blue-800"
      case "organization":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRequestFood = async (foodItem: any) => {
    if (!profile) {
      toast({
        title: "Acceso requerido",
        description: "Debes iniciar sesión para solicitar alimentos",
        variant: "destructive",
      })
      return
    }

    if (profile.role !== "beneficiario") {
      toast({
        title: "Acceso restringido",
        description: "Solo las organizaciones beneficiarias pueden solicitar alimentos",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("food_requests").insert({
        food_item_id: foodItem.id,
        beneficiary_id: profile.id,
        status: "pendiente",
        quantity_requested: foodItem.quantity,
      })

      if (error) throw error

      toast({
        title: "¡Solicitud enviada!",
        description: "El donante recibirá tu solicitud y te contactará pronto",
      })

      // Recargar datos después de un breve delay
      setTimeout(() => {
        loadData()
      }, 500)
    } catch (error) {
      console.error("Error requesting food:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intenta nuevamente",
        variant: "destructive",
      })
    }
  }

  const handleJoinEvent = async (event: any) => {
    if (!profile) {
      toast({
        title: "Acceso requerido",
        description: "Debes iniciar sesión para unirte a eventos",
        variant: "destructive",
      })
      return
    }

    try {
      // Verificar si ya está registrado
      const { data: existingRegistration } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", event.id)
        .eq("volunteer_id", profile.id)
        .single()

      if (existingRegistration) {
        toast({
          title: "Ya estás registrado",
          description: "Ya te habías unido a este evento anteriormente",
        })
        return
      }

      // Verificar si hay cupo disponible
      if (event.max_volunteers && event.registered_volunteers >= event.max_volunteers) {
        toast({
          title: "Evento lleno",
          description: "Este evento ya alcanzó el número máximo de voluntarios",
          variant: "destructive",
        })
        return
      }

      // Registrar al voluntario en el evento
      const { error } = await supabase.from("event_participants").insert({
        event_id: event.id,
        volunteer_id: profile.id,
        status: "confirmado",
      })

      if (error) throw error

      toast({
        title: "¡Te has unido al evento!",
        description: "Recibirás más detalles por correo electrónico",
      })

      // Recargar datos después de un breve delay para permitir que el trigger actualice
      setTimeout(() => {
        loadData()
      }, 500)
    } catch (error) {
      console.error("Error joining event:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar en el evento. Intenta nuevamente",
        variant: "destructive",
      })
    }
  }

  const handleGetDirections = (location: MapLocation) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`
    window.open(googleMapsUrl, "_blank")
  }

  const handleContactOrganization = (organization: any) => {
    if (organization.email) {
      window.location.href = `mailto:${organization.email}?subject=Consulta desde Banco de Alimentos`
    } else if (organization.phone) {
      window.location.href = `tel:${organization.phone}`
    } else {
      toast({
        title: "Información no disponible",
        description: "No hay datos de contacto disponibles para esta organización",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando mapa...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mapa de la Comunidad</h1>
          <p className="text-gray-600 mt-2">Encuentra alimentos, eventos y organizaciones cerca de ti</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters and List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar ubicaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    <SelectItem value="food">🍽️ Alimentos disponibles</SelectItem>
                    <SelectItem value="event">📅 Eventos de voluntariado</SelectItem>
                    <SelectItem value="organization">🏢 Organizaciones</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    {filteredLocations.length} ubicaciones
                  </span>
                  {userLocation && (
                    <Button variant="outline" size="sm" onClick={getUserLocation}>
                      <Navigation className="h-4 w-4 mr-1" />
                      Mi ubicación
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron ubicaciones</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLocations.map((location) => (
                  <Card
                    key={location.id}
                    className={`cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id ? "ring-2 ring-green-500" : ""
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getLocationIcon(location.type)}</span>
                          <h3 className="font-medium text-sm">{location.title}</h3>
                        </div>
                        <Badge className={getLocationColor(location.type)}>
                          {location.type === "food" && "Alimento"}
                          {location.type === "event" && "Evento"}
                          {location.type === "organization" && "Organización"}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{location.description}</p>

                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {location.address}
                        {userLocation && (
                          <span className="ml-2">
                            •{" "}
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              location.latitude,
                              location.longitude,
                            ).toFixed(1)}{" "}
                            km
                          </span>
                        )}
                      </div>

                      {location.date && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(location.date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Mapa Interactivo Real */}
          <div className="lg:col-span-2">
            <Card className="h-96 lg:h-[600px]">
              <CardContent className="p-0 h-full">
                <MapaInteractivo
                  locations={filteredLocations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  userLocation={userLocation}
                />
              </CardContent>
            </Card>

            {/* Leyenda del mapa */}
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">🍽️ Alimentos disponibles</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700">📅 Eventos de voluntariado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-700">🏢 Organizaciones</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-700">📍 Tu ubicación</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getLocationIcon(selectedLocation.type)}</span>
                  <div>
                    <CardTitle>{selectedLocation.title}</CardTitle>
                    <CardDescription>{selectedLocation.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getLocationColor(selectedLocation.type)}>
                  {selectedLocation.type === "food" && "Alimento Disponible"}
                  {selectedLocation.type === "event" && "Evento de Voluntariado"}
                  {selectedLocation.type === "organization" && "Organización"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Ubicación</h4>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedLocation.address}
                  </div>

                  {userLocation && (
                    <div className="text-sm text-gray-600">
                      <strong>Distancia:</strong>{" "}
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                      ).toFixed(1)}{" "}
                      km de tu ubicación
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedLocation.type === "food" && (
                    <div>
                      <h4 className="font-medium mb-2">Detalles del Alimento</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Cantidad:</strong> {selectedLocation.data.quantity} {selectedLocation.data.unit}
                        </div>
                        {selectedLocation.data.expiry_date && (
                          <div>
                            <strong>Vence:</strong> {new Date(selectedLocation.data.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                        {selectedLocation.data.donor && (
                          <div>
                            <strong>Donado por:</strong> {selectedLocation.data.donor.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLocation.type === "event" && (
                    <div>
                      <h4 className="font-medium mb-2">Detalles del Evento</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Fecha:</strong> {new Date(selectedLocation.data.event_date).toLocaleString()}
                        </div>
                        <div>
                          <strong>Voluntarios:</strong> {selectedLocation.data.registered_volunteers} /{" "}
                          {selectedLocation.data.max_volunteers || "∞"}
                        </div>
                        {selectedLocation.data.requirements && (
                          <div>
                            <strong>Requisitos:</strong> {selectedLocation.data.requirements}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLocation.type === "organization" && (
                    <div>
                      <h4 className="font-medium mb-2">Información de la Organización</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Tipo:</strong> {selectedLocation.data.organization_type || "No especificado"}
                        </div>
                        {selectedLocation.data.city && (
                          <div>
                            <strong>Ciudad:</strong> {selectedLocation.data.city}
                          </div>
                        )}
                        {selectedLocation.data.phone && (
                          <div>
                            <strong>Teléfono:</strong> {selectedLocation.data.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.type === "food" && profile?.role === "beneficiario" && (
                      <Button size="sm" onClick={() => handleRequestFood(selectedLocation.data)}>
                        <Heart className="h-4 w-4 mr-2" />
                        Solicitar Alimento
                      </Button>
                    )}
                    {selectedLocation.type === "event" && profile && (
                      <Button size="sm" onClick={() => handleJoinEvent(selectedLocation.data)}>
                        <Users className="h-4 w-4 mr-2" />
                        Unirse al Evento
                      </Button>
                    )}
                    {selectedLocation.type === "organization" && (
                      <Button size="sm" onClick={() => handleContactOrganization(selectedLocation.data)}>
                        <Users className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleGetDirections(selectedLocation)}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Cómo llegar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
