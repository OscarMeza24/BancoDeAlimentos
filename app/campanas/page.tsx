"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, TrendingUp, Calendar, DollarSign, Plus, Search, Filter, Users } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, Campaign } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function CampanasPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCampaigns()
  }, [searchTerm, statusFilter])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await loadCampaigns()
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          creator:profiles!campaigns_created_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error("Error loading campaigns:", error)
    }
  }

  const filterCampaigns = () => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((campaign) => campaign.status === statusFilter)
    }

    return filtered
  }

  const handleDonate = async (campaignId: string, amount: number) => {
    if (!profile) return

    try {
      // Simular donación (en producción se integraría con Stripe/PayPal)
      const { error: donationError } = await supabase.from("monetary_donations").insert({
        donor_id: profile.id,
        campaign_id: campaignId,
        amount: amount,
        currency: "USD",
        payment_method: "simulado",
        status: "completada",
      })

      if (donationError) throw donationError

      // Actualizar el monto actual de la campaña
      const campaign = campaigns.find((c) => c.id === campaignId)
      if (campaign) {
        const { error: updateError } = await supabase
          .from("campaigns")
          .update({ current_amount: campaign.current_amount + amount })
          .eq("id", campaignId)

        if (updateError) throw updateError
      }

      // Crear notificación
      await supabase.from("notifications").insert({
        user_id: profile.id,
        title: "Donación realizada",
        message: `Has donado $${amount} a la campaña: ${campaign?.title}`,
        type: "donacion",
        action_url: `/campanas/${campaignId}`,
      })

      toast({
        title: "¡Donación exitosa!",
        description: `Has donado $${amount} a la campaña`,
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
      case "activa":
        return "bg-green-100 text-green-800"
      case "pausada":
        return "bg-yellow-100 text-yellow-800"
      case "completada":
        return "bg-blue-100 text-blue-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressPercentage = (current: number, goal?: number) => {
    if (!goal) return 0
    return Math.min((current / goal) * 100, 100)
  }

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const filteredCampaigns = filterCampaigns()

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando campañas...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campañas Solidarias</h1>
            <p className="text-gray-600 mt-2">Apoya causas importantes y ayuda a crear un impacto positivo</p>
          </div>

          {profile?.role === "administrador" && (
            <Button asChild>
              <Link href="/campanas/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Crear Campaña
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.filter((c) => c.status === "activa").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${campaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${campaigns.reduce((sum, c) => sum + (c.goal_amount || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campañas Completadas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.filter((c) => c.status === "completada").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de la campaña" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activa">Activas</SelectItem>
                  <SelectItem value="pausada">Pausadas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredCampaigns.length} campaña{filteredCampaigns.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay campañas disponibles</h3>
              <p className="text-gray-600 mb-4">No se encontraron campañas que coincidan con tus filtros</p>
              {profile?.role === "administrador" && (
                <Button asChild>
                  <Link href="/campanas/nueva">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Campaña
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const progressPercentage = getProgressPercentage(campaign.current_amount, campaign.goal_amount)
              const daysRemaining = getDaysRemaining(campaign.end_date)

              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                    {campaign.image_url ? (
                      <img
                        src={campaign.image_url || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="h-16 w-16 text-green-600 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status === "activa" && "Activa"}
                        {campaign.status === "pausada" && "Pausada"}
                        {campaign.status === "completada" && "Completada"}
                        {campaign.status === "cancelada" && "Cancelada"}
                      </Badge>
                    </div>
                    {daysRemaining !== null && daysRemaining > 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {daysRemaining} día{daysRemaining !== 1 ? "s" : ""} restante{daysRemaining !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    {campaign.description && <CardDescription>{campaign.description}</CardDescription>}
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      {campaign.goal_amount && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-medium">
                              ${campaign.current_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="text-xs text-gray-500 text-center">
                            {progressPercentage.toFixed(1)}% completado
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Inicio: {new Date(campaign.start_date).toLocaleDateString()}
                        </div>
                        {campaign.end_date && <div>Fin: {new Date(campaign.end_date).toLocaleDateString()}</div>}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        {campaign.status === "activa" && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleDonate(campaign.id, 10)} className="flex-1">
                              <DollarSign className="h-4 w-4 mr-1" />
                              $10
                            </Button>
                            <Button size="sm" onClick={() => handleDonate(campaign.id, 25)} className="flex-1">
                              <DollarSign className="h-4 w-4 mr-1" />
                              $25
                            </Button>
                            <Button size="sm" onClick={() => handleDonate(campaign.id, 50)} className="flex-1">
                              <DollarSign className="h-4 w-4 mr-1" />
                              $50
                            </Button>
                          </div>
                        )}

                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/campanas/${campaign.id}`}>Ver Detalles</Link>
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
