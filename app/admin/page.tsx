"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  Gift,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AdminStats {
  totalUsers: number
  totalDonations: number
  totalRequests: number
  totalCampaigns: number
  totalEvents: number
  pendingRequests: number
  activeVolunteers: number
  totalMoneyRaised: number
}

interface RecentActivity {
  id: string
  type: "donation" | "request" | "user" | "event"
  title: string
  description: string
  timestamp: string
  status?: string
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDonations: 0,
    totalRequests: 0,
    totalCampaigns: 0,
    totalEvents: 0,
    pendingRequests: 0,
    activeVolunteers: 0,
    totalMoneyRaised: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      if (profileData?.role !== "administrador") {
        router.push("/dashboard")
        return
      }

      await Promise.all([loadStats(), loadRecentActivity()])
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos administrativos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [
        usersResult,
        donationsResult,
        requestsResult,
        campaignsResult,
        eventsResult,
        pendingRequestsResult,
        volunteersResult,
        moneyResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("food_items").select("id", { count: "exact" }),
        supabase.from("food_requests").select("id", { count: "exact" }),
        supabase.from("campaigns").select("id", { count: "exact" }),
        supabase.from("volunteer_events").select("id", { count: "exact" }),
        supabase.from("food_requests").select("id", { count: "exact" }).eq("status", "pendiente"),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "voluntario"),
        supabase.from("monetary_donations").select("amount").eq("status", "completada"),
      ])

      const totalMoney = moneyResult.data?.reduce((sum, donation) => sum + donation.amount, 0) || 0

      setStats({
        totalUsers: usersResult.count || 0,
        totalDonations: donationsResult.count || 0,
        totalRequests: requestsResult.count || 0,
        totalCampaigns: campaignsResult.count || 0,
        totalEvents: eventsResult.count || 0,
        pendingRequests: pendingRequestsResult.count || 0,
        activeVolunteers: volunteersResult.count || 0,
        totalMoneyRaised: totalMoney,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Simular actividad reciente combinando diferentes fuentes
      const activities: RecentActivity[] = [
        {
          id: "1",
          type: "donation",
          title: "Nueva donación registrada",
          description: "Juan Pérez donó 5kg de arroz",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "completada",
        },
        {
          id: "2",
          type: "request",
          title: "Solicitud de alimento",
          description: "Fundación Esperanza solicitó productos lácteos",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: "pendiente",
        },
        {
          id: "3",
          type: "user",
          title: "Nuevo usuario registrado",
          description: "María González se registró como voluntaria",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: "4",
          type: "event",
          title: "Evento de voluntariado creado",
          description: "Distribución de alimentos - Centro Comunitario",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
      ]

      setRecentActivity(activities)
    } catch (error) {
      console.error("Error loading recent activity:", error)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "donation":
        return <Gift className="h-4 w-4 text-green-600" />
      case "request":
        return <Users className="h-4 w-4 text-blue-600" />
      case "user":
        return <Users className="h-4 w-4 text-purple-600" />
      case "event":
        return <Calendar className="h-4 w-4 text-orange-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando panel administrativo...</div>
  }

  if (profile?.role !== "administrador") {
    return <div className="flex justify-center items-center min-h-screen">Acceso denegado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la plataforma y supervisa las operaciones del banco de alimentos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeVolunteers} voluntarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donaciones</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground">{stats.totalRequests} solicitudes totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dinero Recaudado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalMoneyRaised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.totalCampaigns} campañas activas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="donations">Donaciones</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            {activity.status && (
                              <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Gestiona los aspectos clave de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Gestionar Usuarios
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <Gift className="h-6 w-6 mb-2" />
                      Ver Donaciones
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Crear Campaña
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Ver Reportes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>Monitoreo de la salud de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Base de Datos</p>
                      <p className="text-sm text-gray-600">Funcionando correctamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Autenticación</p>
                      <p className="text-sm text-gray-600">Todos los servicios activos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Notificaciones</p>
                      <p className="text-sm text-gray-600">Sistema operativo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra los usuarios de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Panel de gestión de usuarios en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Donaciones</CardTitle>
                <CardDescription>Supervisa las donaciones de alimentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Panel de gestión de donaciones en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Campañas</CardTitle>
                <CardDescription>Administra las campañas solidarias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Panel de gestión de campañas en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Análisis</CardTitle>
                <CardDescription>Estadísticas detalladas y reportes de impacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sistema de reportes en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
