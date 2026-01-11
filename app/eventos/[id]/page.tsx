"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Clock, ArrowLeft, User } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, VolunteerEvent } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface EventParticipant {
  id: string
  volunteer_id: string
  status: string
  created_at: string
  volunteer: Profile
}

export default function EventoDetallesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [event, setEvent] = useState<VolunteerEvent | null>(null)
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    loadData()
    setupRealtimeListener()

    return () => {
      // Cleanup: unsubscribe from realtime
      supabase
        .channel(`volunteer_events:${eventId}`)
        .unsubscribe()
      supabase
        .channel(`event_participants:${eventId}`)
        .unsubscribe()
    }
  }, [eventId])

  const setupRealtimeListener = () => {
    // Escuchar cambios en el evento (incluyendo registered_volunteers)
    supabase
      .channel(`volunteer_events:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "volunteer_events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          const updatedEvent = payload.new as VolunteerEvent
          setEvent(updatedEvent)
        }
      )
      .subscribe()

    // Escuchar cambios en los participantes
    supabase
      .channel(`event_participants:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Recargar participantes cuando hay cambios
          await loadParticipants()
        }
      )
      .subscribe()
  }

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await Promise.all([loadEvent(), loadParticipants()])
      
      if (profileData) {
        await checkRegistration(profileData.id)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del evento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteer_events")
        .select(`
          *,
          creator:profiles!volunteer_events_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq("id", eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error("Error loading event:", error)
    }
  }

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("event_participants")
        .select(`
          *,
          volunteer:profiles!event_participants_volunteer_id_fkey(id, full_name, avatar_url, organization_name)
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setParticipants(data || [])
    } catch (error) {
      console.error("Error loading participants:", error)
    }
  }

  const checkRegistration = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", eventId)
        .eq("volunteer_id", userId)
        .single()

      setIsRegistered(!!data)
    } catch (error) {
      // No registrado
      setIsRegistered(false)
    }
  }

  const handleJoinEvent = async () => {
    if (!profile) return

    try {
      // El trigger update_event_volunteers_count() actualizará automáticamente el contador
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        volunteer_id: profile.id,
        status: "registrado",
      })

      if (error) throw error

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

      // La actualización se reflejará automáticamente gracias al listener de realtime
      setIsRegistered(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleLeaveEvent = async () => {
    if (!profile) return

    try {
      // El trigger update_event_volunteers_count() actualizará automáticamente el contador
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("volunteer_id", profile.id)

      if (error) throw error

      toast({
        title: "Has salido del evento",
        description: "Ya no estás registrado en este evento",
      })

      // La actualización se reflejará automáticamente gracias al listener de realtime
      setIsRegistered(false)
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

  const isEventFull = () => {
    if (!event) return false
    return event.max_volunteers ? event.registered_volunteers >= event.max_volunteers : false
  }

  const isEventPast = () => {
    if (!event) return false
    return new Date(event.event_date) < new Date()
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando evento...</div>
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Evento no encontrado</h3>
            <p className="text-gray-600 mb-4">Este evento no existe o ha sido eliminado</p>
            <Button asChild>
              <Link href="/eventos">Volver a Eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/eventos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <Card>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-blue-600 opacity-50" />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status === "programado" && "Programado"}
                    {event.status === "en_curso" && "En Curso"}
                    {event.status === "completado" && "Completado"}
                    {event.status === "cancelado" && "Cancelado"}
                  </Badge>
                </div>
                {isRegistered && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-100 text-green-800">Estás Registrado</Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                {event.description && <CardDescription className="text-base">{event.description}</CardDescription>}
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Categoría */}
                  {event.category && (
                    <div>
                      <Badge variant="outline" className="mb-3">
                        {event.category === "recoleccion" && "🎁 Recolección"}
                        {event.category === "distribucion" && "📦 Distribución"}
                        {event.category === "capacitacion" && "📚 Capacitación"}
                        {event.category === "limpieza" && "🧹 Limpieza"}
                        {event.category === "general" && "📋 General"}
                        {event.category === "otro" && "🔧 Otro"}
                      </Badge>
                    </div>
                  )}

                  {/* Fecha y hora */}
                  <div className="flex items-start text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Fecha y Hora</p>
                      <p className="text-sm text-gray-600">{new Date(event.event_date).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Ubicación en Mapa */}
                  {event.location && (
                    <div className="flex items-start text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Ubicación</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        {event.latitude && event.longitude && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordenadas: {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Punto de Encuentro */}
                  {event.meeting_point && (
                    <div className="flex items-start text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Punto de Encuentro</p>
                        <p className="text-sm text-gray-600">{event.meeting_point}</p>
                      </div>
                    </div>
                  )}

                  {/* Voluntarios */}
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-3 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">Voluntarios Registrados</p>
                      <p className="text-sm text-gray-600">
                        {event.registered_volunteers} voluntario{event.registered_volunteers !== 1 ? "s" : ""}
                        {event.max_volunteers && ` de ${event.max_volunteers}`}
                      </p>
                      {event.max_volunteers && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((event.registered_volunteers / event.max_volunteers) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Materiales Requeridos */}
                  {event.required_materials && (
                    <div className="flex items-start text-gray-700">
                      <div className="h-5 w-5 mr-3 text-orange-500 mt-0.5 flex items-center justify-center">
                        📋
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Materiales Requeridos</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.required_materials}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Actions */}
                {!isEventPast() && event.status === "programado" && (
                  <div className="space-y-2">
                    {isRegistered ? (
                      <Button variant="outline" onClick={handleLeaveEvent} className="w-full">
                        Salir del Evento
                      </Button>
                    ) : (
                      <Button onClick={handleJoinEvent} disabled={isEventFull()} className="w-full">
                        {isEventFull() ? "Evento Completo" : "Unirse al Evento"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizador */}
            {event.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organizador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={event.creator.avatar_url} />
                      <AvatarFallback>
                        {event.creator.full_name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.creator.full_name || "Sin nombre"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voluntarios ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-500">Aún no hay voluntarios registrados</p>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.volunteer.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {participant.volunteer.full_name?.charAt(0) || <User className="h-3 w-3" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {participant.volunteer.full_name || "Sin nombre"}
                          </p>
                          {participant.volunteer.organization_name && (
                            <p className="text-xs text-gray-500 truncate">
                              {participant.volunteer.organization_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
