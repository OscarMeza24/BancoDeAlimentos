"use client"

import { useState, useEffect } from "react"
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

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-96 lg:h-full">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Map placeholder with locations */}
                  <div className="absolute inset-0 p-8">
                    <div className="relative w-full h-full">
                      {/* Simulated map markers */}
                      {filteredLocations.slice(0, 10).map((location, index) => (
                        <div
                          key={location.id}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                            location.type === "food"
                              ? "bg-green-500"
                              : location.type === "event"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                          } ${selectedLocation?.id === location.id ? "ring-4 ring-white scale-110" : ""}`}
                          style={{
                            left: `${20 + (index % 3) * 30}%`,
                            top: `${20 + Math.floor(index / 3) * 25}%`,
                          }}
                          onClick={() => setSelectedLocation(location)}
                        >
                          {getLocationIcon(location.type)}
                        </div>
                      ))}

                      {/* User location marker */}
                      {userLocation && (
                        <div
                          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: "50%", top: "50%" }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="text-center z-10">
                    <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Mapa Interactivo</h3>
                    <p className="text-gray-600 mb-4">
                      Vista simulada del mapa con ubicaciones de alimentos, eventos y organizaciones
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Alimentos
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Eventos
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        Organizaciones
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {selectedLocation.type === "food" && profile?.role === "beneficiario" && (
                      <Button size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Solicitar Alimento
                      </Button>
                    )}
                    {selectedLocation.type === "event" && (
                      <Button size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Unirse al Evento
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
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
