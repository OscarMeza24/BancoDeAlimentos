"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock, Plus, Search, Filter } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, VolunteerEvent } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function EventosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [events, setEvents] = useState<VolunteerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchTerm, statusFilter])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await Promise.all([loadEvents(), loadRegisteredEvents(profileData?.id)])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteer_events")
        .select(`
          *,
          creator:profiles!volunteer_events_created_by_fkey(full_name)
        `)
        .order("event_date", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const loadRegisteredEvents = async (userId?: string) => {
    if (!userId) return

    try {
      const { data, error } = await supabase.from("event_participants").select("event_id").eq("volunteer_id", userId)

      if (error) throw error
      setRegisteredEvents(data?.map((p) => p.event_id) || [])
    } catch (error) {
      console.error("Error loading registered events:", error)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter)
    }

    return filtered
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        volunteer_id: profile.id,
        status: "registrado",
      })

      if (error) throw error

      // Actualizar contador de voluntarios registrados
      const event = events.find((e) => e.id === eventId)
      if (event) {
        await supabase
          .from("volunteer_events")
          .update({ registered_volunteers: event.registered_volunteers + 1 })
          .eq("id", eventId)
      }

      // Crear notificación
      await supabase.from("notifications").insert({
        user_id: profile.id,
        title: "Te has unido a un evento",
        message: `Te has registrado para el evento: ${event?.title}`,
        type: "evento",
        action_url: `/eventos/${eventId}`,
      })

      toast({
        title: "¡Registrado exitosamente!",
        description: "Te has unido al evento de voluntariado",
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("volunteer_id", profile.id)

      if (error) throw error

      // Actualizar contador de voluntarios registrados
      const event = events.find((e) => e.id === eventId)
      if (event && event.registered_volunteers > 0) {
        await supabase
          .from("volunteer_events")
          .update({ registered_volunteers: event.registered_volunteers - 1 })
          .eq("id", eventId)
      }

      toast({
        title: "Has salido del evento",
        description: "Ya no estás registrado en este evento",
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado":
        return "bg-blue-100 text-blue-800"
      case "en_curso":
        return "bg-yellow-100 text-yellow-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isEventFull = (event: VolunteerEvent) => {
    return event.max_volunteers ? event.registered_volunteers >= event.max_volunteers : false
  }

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date()
  }

  const filteredEvents = filterEvents()

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando eventos...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eventos de Voluntariado</h1>
            <p className="text-gray-600 mt-2">Únete a eventos comunitarios y marca la diferencia</p>
          </div>

          {(profile?.role === "administrador" || profile?.role === "voluntario") && (
            <Button asChild>
              <Link href="/eventos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="programado">Programados</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="completado">Completados</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos disponibles</h3>
              <p className="text-gray-600 mb-4">No se encontraron eventos que coincidan con tus filtros</p>
              {(profile?.role === "administrador" || profile?.role === "voluntario") && (
                <Button asChild>
                  <Link href="/eventos/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Evento
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isRegistered = registeredEvents.includes(event.id)
              const isFull = isEventFull(event)
              const isPast = isEventPast(event.event_date)

              return (
                <Card key={event.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-blue-600 opacity-50" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === "programado" && "Programado"}
                        {event.status === "en_curso" && "En Curso"}
                        {event.status === "completado" && "Completado"}
                        {event.status === "cancelado" && "Cancelado"}
                      </Badge>
                    </div>
                    {isRegistered && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-100 text-green-800">Registrado</Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.description && <CardDescription>{event.description}</CardDescription>}
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* Fecha y hora */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(event.event_date).toLocaleString()}
                      </div>

                      {/* Ubicación */}
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      )}

                      {/* Voluntarios */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.registered_volunteers} voluntario{event.registered_volunteers !== 1 ? "s" : ""}
                          {event.max_volunteers && ` / ${event.max_volunteers}`}
                        </div>
                        {isFull && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Completo
                          </Badge>
                        )}
                      </div>

                      {/* Progress bar for volunteers */}
                      {event.max_volunteers && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((event.registered_volunteers / event.max_volunteers) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 space-y-2">
                        {!isPast && event.status === "programado" && (
                          <>
                            {isRegistered ? (
                              <Button
                                variant="outline"
                                onClick={() => handleLeaveEvent(event.id)}
                                className="w-full bg-transparent"
                              >
                                Salir del Evento
                              </Button>
                            ) : (
                              <Button onClick={() => handleJoinEvent(event.id)} disabled={isFull} className="w-full">
                                {isFull ? "Evento Completo" : "Unirse al Evento"}
                              </Button>
                            )}
                          </>
                        )}

                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/eventos/${event.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
