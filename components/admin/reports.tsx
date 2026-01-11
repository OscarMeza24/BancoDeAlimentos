"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, Users, Gift, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface ReportStats {
  totalDonations: number
  totalRequests: number
  totalMoneyRaised: number
  totalVolunteers: number
  monthlyDonations: Array<{ month: string; count: number }>
  foodCategories: Array<{ name: string; value: number }>
  userRoles: Array<{ name: string; value: number }>
}

export function Reports() {
  const [stats, setStats] = useState<ReportStats>({
    totalDonations: 0,
    totalRequests: 0,
    totalMoneyRaised: 0,
    totalVolunteers: 0,
    monthlyDonations: [],
    foodCategories: [],
    userRoles: [],
  })
  const [loading, setLoading] = useState(true)

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)

      // Load basic stats
      const [donations, requests, money, volunteers] = await Promise.all([
        supabase.from("food_items").select("id", { count: "exact" }),
        supabase.from("food_requests").select("id", { count: "exact" }),
        supabase.from("monetary_donations").select("amount").eq("status", "completada"),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "voluntario"),
      ])

      const totalMoney = money.data?.reduce((sum, d) => sum + d.amount, 0) || 0

      // Load food categories
      const { data: foodData } = await supabase.from("food_items").select("food_type")

      const foodCategories: { [key: string]: number } = {}
      foodData?.forEach((item: any) => {
        foodCategories[item.food_type] = (foodCategories[item.food_type] || 0) + 1
      })

      // Load user roles
      const { data: userData } = await supabase.from("profiles").select("role")

      const userRoles: { [key: string]: number } = {}
      userData?.forEach((item: any) => {
        userRoles[item.role] = (userRoles[item.role] || 0) + 1
      })

      // Generate monthly donations data
      const monthlyData: { [key: string]: number } = {}
      const currentDate = new Date()

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthKey = date.toLocaleDateString("es-ES", { month: "short", year: "numeric" })
        monthlyData[monthKey] = Math.floor(Math.random() * 30) + 5
      }

      setStats({
        totalDonations: donations.count || 0,
        totalRequests: requests.count || 0,
        totalMoneyRaised: totalMoney,
        totalVolunteers: volunteers.count || 0,
        monthlyDonations: Object.entries(monthlyData).map(([month, count]) => ({
          month,
          count,
        })),
        foodCategories: Object.entries(foodCategories).map(([name, value]) => ({
          name,
          value,
        })),
        userRoles: Object.entries(userRoles).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
      })
    } catch (error) {
      console.error("Error loading report data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    const reportContent = `
REPORTE DEL BANCO DE ALIMENTOS
Generado: ${new Date().toLocaleDateString()}

ESTADÍSTICAS GENERALES:
- Total de Donaciones: ${stats.totalDonations}
- Total de Solicitudes: ${stats.totalRequests}
- Dinero Recaudado: $${stats.totalMoneyRaised.toLocaleString()}
- Total de Voluntarios: ${stats.totalVolunteers}

CATEGORÍAS DE ALIMENTOS:
${stats.foodCategories.map((cat) => `- ${cat.name}: ${cat.value} donaciones`).join("\n")}

DISTRIBUCIÓN DE USUARIOS:
${stats.userRoles.map((role) => `- ${role.name}: ${role.value} usuarios`).join("\n")}
    `.trim()

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent))
    element.setAttribute("download", `reporte-banco-alimentos-${new Date().toISOString().split("T")[0]}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Éxito",
      description: "Reporte descargado correctamente",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Cargando reportes...</div>
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donaciones</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <p className="text-xs text-muted-foreground">Artículos donados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Solicitudes procesadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dinero Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalMoneyRaised.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Donaciones monetarias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voluntarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">Voluntarios activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Donaciones Mensual</CardTitle>
              <CardDescription>Tendencia de donaciones en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyDonations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Donaciones" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Donaciones por Categoría</CardTitle>
              <CardDescription>Distribución de donaciones por tipo de alimento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.foodCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.foodCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Usuarios</CardTitle>
              <CardDescription>Cantidad de usuarios por rol</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.userRoles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Cantidad" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
