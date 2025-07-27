"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, Gift, TrendingUp, Calendar, MapPin, Plus, Clock, CheckCircle } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, FoodItem, Campaign, VolunteerEvent } from "@/lib/supabase"
import Link from "next/link"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalRequests: 0,
    activeCampaigns: 0,
    upcomingEvents: 0,
  })
  const [recentItems, setRecentItems] = useState<FoodItem[]>([])
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<VolunteerEvent[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      if (profileData) {
        await Promise.all([
          loadStats(profileData),
          loadRecentItems(profileData),
          loadActiveCampaigns(),
          loadUpcomingEvents(),
        ])
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const loadStats = async (profile: Profile) => {
    try {
      const [donationsResult, requestsResult, campaignsResult, eventsResult] = await Promise.all([
        // Total donaciones del usuario
        supabase
          .from("food_items")
          .select("id", { count: "exact" })
          .eq("donor_id", profile.id),

        // Total solicitudes del usuario (si es beneficiario)
        supabase
          .from("food_requests")
          .select("id", { count: "exact" })
          .eq("beneficiary_id", profile.id),

        // Campañas activas
        supabase
          .from("campaigns")
          .select("id", { count: "exact" })
          .eq("status", "activa"),

        // Eventos próximos
        supabase
          .from("volunteer_events")
          .select("id", { count: "exact" })
          .eq("status", "programado")
          .gte("event_date", new Date().toISOString()),
      ])

      setStats({
        totalDonations: donationsResult.count || 0,
        totalRequests: requestsResult.count || 0,
        activeCampaigns: campaignsResult.count || 0,
        upcomingEvents: eventsResult.count || 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const loadRecentItems = async (profile: Profile) => {
    try {
      const { data, error } = await supabase
        .from("food_items")
        .select(`
          *,
          category:food_categories(name, icon),
          donor:profiles(full_name)
        `)
        .eq(profile.role === "donante" ? "donor_id" : "status", profile.role === "donante" ? profile.id : "disponible")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentItems(data || [])
    } catch (error) {
      console.error("Error loading recent items:", error)
    }
  }

  const loadActiveCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "activa")
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) throw error
      setActiveCampaigns(data || [])
    } catch (error) {
      console.error("Error loading campaigns:", error)
    }
  }

  const loadUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteer_events")
        .select("*")
        .eq("status", "programado")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3)

      if (error) throw error
      setUpcomingEvents(data || [])
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "reservado":
        return "bg-yellow-100 text-yellow-800"
      case "entregado":
        return "bg-blue-100 text-blue-800"
      case "expirado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  if (!profile) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {profile.full_name || "Usuario"}
          </h1>
          <p className="text-gray-600 mt-2">
            {profile.role === "donante" && "Gracias por tu generosidad. Cada donación cuenta."}
            {profile.role === "beneficiario" && "Encuentra los alimentos que necesitas en tu comunidad."}
            {profile.role === "voluntario" && "Tu tiempo y esfuerzo hacen la diferencia."}
            {profile.role === "administrador" && "Gestiona la plataforma y supervisa las operaciones."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile.role === "donante" ? "Mis Donaciones" : "Alimentos Disponibles"}
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === "donante" ? "Productos donados" : "Productos disponibles"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile.role === "beneficiario" ? "Mis Solicitudes" : "Solicitudes Recibidas"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === "beneficiario" ? "Solicitudes realizadas" : "Solicitudes de alimentos"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Campañas en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Próximos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Eventos de voluntariado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Food Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {profile.role === "donante" ? "Mis Donaciones Recientes" : "Alimentos Disponibles"}
                </CardTitle>
                <CardDescription>
                  {profile.role === "donante"
                    ? "Tus últimas donaciones registradas"
                    : "Alimentos disponibles cerca de ti"}
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/alimentos">
                  <Plus className="h-4 w-4 mr-2" />
                  {profile.role === "donante" ? "Donar" : "Ver Todos"}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {profile.role === "donante"
                      ? "No has registrado donaciones aún"
                      : "No hay alimentos disponibles en este momento"}
                  </div>
                ) : (
                  recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{item.category?.icon || "🍽️"}</div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} {item.unit}
                            {item.expiry_date && (
                              <span className="ml-2">• Vence: {new Date(item.expiry_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        {item.status === "disponible" && <Clock className="h-4 w-4 text-gray-400" />}
                        {item.status === "entregado" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campañas Activas</CardTitle>
                <CardDescription>Campañas que necesitan tu apoyo</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/campanas">Ver Todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No hay campañas activas en este momento</div>
                ) : (
                  activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{campaign.title}</h3>
                        <Badge variant="outline">Activa</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                      {campaign.goal_amount && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>
                              ${campaign.current_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={(campaign.current_amount / campaign.goal_amount) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximos Eventos de Voluntariado</CardTitle>
                <CardDescription>Únete a estos eventos y marca la diferencia</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/eventos">Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant="outline">{new Date(event.event_date).toLocaleDateString()}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {event.registered_volunteers} / {event.max_volunteers || "∞"} voluntarios
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.role === "donante" && (
                <Button asChild className="h-20 flex-col">
                  <Link href="/alimentos/nuevo">
                    <Gift className="h-6 w-6 mb-2" />
                    Donar Alimentos
                  </Link>
                </Button>
              )}

              {profile.role === "beneficiario" && (
                <Button asChild className="h-20 flex-col">
                  <Link href="/alimentos">
                    <Users className="h-6 w-6 mb-2" />
                    Buscar Alimentos
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/mapa">
                  <MapPin className="h-6 w-6 mb-2" />
                  Ver Mapa
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/eventos">
                  <Calendar className="h-6 w-6 mb-2" />
                  Eventos
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                <Link href="/campanas">
                  <Heart className="h-6 w-6 mb-2" />
                  Campañas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
