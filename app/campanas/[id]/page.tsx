"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, TrendingUp, ArrowLeft, Heart } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, Campaign } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function CampanaDetallesPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [campaignId])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await loadCampaign()
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la campaña",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCampaign = async () => {
    try {
      const { data, error } = await supabase.from("campaigns").select("*").eq("id", campaignId).single()

      if (error) throw error
      setCampaign(data)
    } catch (error) {
      console.error("Error loading campaign:", error)
    }
  }

  const handleDonate = async () => {
    if (!profile || !campaign) return

    const amount = parseFloat(donationAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Crear donación monetaria
      // El trigger update_campaign_amount() actualizará automáticamente el monto de la campaña
      const { error: donationError } = await supabase.from("monetary_donations").insert({
        donor_id: profile.id,
        amount: amount,
        currency: "USD",
        payment_method: "simulado",
        status: "completada",
        campaign_id: campaignId,
      })

      if (donationError) throw donationError

      // El trigger update_campaign_amount() actualizará automáticamente current_amount
      // Solo necesitamos actualizar el status si se alcanza la meta
      const updatedAmount = campaign.current_amount + amount
      const updatedStatus = campaign.goal_amount && updatedAmount >= campaign.goal_amount ? "completada" : campaign.status
      
      // Actualizar status solo si cambió
      if (updatedStatus !== campaign.status) {
        await supabase
          .from("campaigns")
          .update({ status: updatedStatus })
          .eq("id", campaignId)
      }

      // Actualización optimista del estado local
      setCampaign({
        ...campaign,
        current_amount: updatedAmount,
        status: updatedStatus,
      })

      // Crear notificación
      await supabase.from("notifications").insert({
        user_id: profile.id,
        title: "Donación realizada",
        message: `Has donado $${amount} a la campaña: ${campaign.title}`,
        type: "donacion",
        action_url: `/campanas/${campaignId}`,
      })

      toast({
        title: "¡Gracias por tu donación!",
        description: `Has donado $${amount} exitosamente`,
      })

      setDonationAmount("")
      
      // Forzar recarga inmediata y luego otra recarga para capturar el trigger
      loadCampaign()
      setTimeout(() => {
        loadCampaign()
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error al procesar donación",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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

  const getProgressPercentage = () => {
    if (!campaign?.goal_amount || campaign.goal_amount === 0) return 0
    return Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando campaña...</div>
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campaña no encontrada</h3>
            <p className="text-gray-600 mb-4">Esta campaña no existe o ha sido eliminada</p>
            <Button asChild>
              <Link href="/campanas">Volver a Campañas</Link>
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
            <Link href="/campanas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campañas
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <Card>
              {campaign.image_url && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status === "activa" && "Activa"}
                      {campaign.status === "pausada" && "Pausada"}
                      {campaign.status === "completada" && "Completada"}
                      {campaign.status === "cancelada" && "Cancelada"}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                {campaign.description && <CardDescription className="text-base">{campaign.description}</CardDescription>}
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Progress */}
                  {campaign.goal_amount && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Recaudado</span>
                        <span className="text-sm font-medium text-gray-700">
                          ${campaign.current_amount.toLocaleString()} de ${campaign.goal_amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-3" />
                      <p className="text-sm text-gray-500 mt-2">{getProgressPercentage().toFixed(1)}% completado</p>
                    </div>
                  )}

                  <Separator />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Inicio</p>
                        <p className="text-sm text-gray-600">{new Date(campaign.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {campaign.end_date && (
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Fin</p>
                          <p className="text-sm text-gray-600">{new Date(campaign.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Donation */}
          <div className="space-y-6">
            {campaign.status === "activa" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Hacer una Donación
                  </CardTitle>
                  <CardDescription>Apoya esta campaña con tu aporte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="50.00"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button onClick={handleDonate} disabled={isProcessing || !donationAmount} className="w-full">
                    {isProcessing ? "Procesando..." : "Donar Ahora"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Este es un simulador. No se procesarán pagos reales.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm text-gray-600">Total Recaudado</span>
                  </div>
                  <span className="font-bold text-green-600">${campaign.current_amount.toLocaleString()}</span>
                </div>

                {campaign.goal_amount && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-600">Meta</span>
                    </div>
                    <span className="font-bold text-blue-600">${campaign.goal_amount.toLocaleString()}</span>
                  </div>
                )}

                {campaign.goal_amount && campaign.current_amount < campaign.goal_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Falta por recaudar</span>
                    <span className="font-bold text-orange-600">
                      ${(campaign.goal_amount - campaign.current_amount).toLocaleString()}
                    </span>
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
