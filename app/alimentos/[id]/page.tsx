"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Package, User, ArrowLeft, MessageSquare } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, FoodItem } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function AlimentoDetallesPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [quantityRequested, setQuantityRequested] = useState(1)

  useEffect(() => {
    loadData()
  }, [itemId])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await loadFoodItem()
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del alimento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadFoodItem = async () => {
    try {
      const { data, error } = await supabase
        .from("food_items")
        .select(`
          *,
          donor:profiles!food_items_donor_id_fkey(id, full_name, avatar_url, organization_name),
          category:food_categories(name, icon)
        `)
        .eq("id", itemId)
        .single()

      if (error) throw error
      setFoodItem(data)
    } catch (error) {
      console.error("Error loading food item:", error)
    }
  }

  const handleRequestFood = async () => {
    if (!profile || !foodItem) return

    if (profile.role !== "beneficiario") {
      toast({
        title: "Sin permisos",
        description: "Solo los beneficiarios pueden solicitar alimentos",
        variant: "destructive",
      })
      return
    }

    if (quantityRequested > foodItem.quantity) {
      toast({
        title: "Cantidad no disponible",
        description: `Solo hay ${foodItem.quantity} ${foodItem.unit} disponibles`,
        variant: "destructive",
      })
      return
    }

    setRequesting(true)

    try {
      // Crear solicitud
      const { error: requestError } = await supabase.from("food_requests").insert({
        beneficiary_id: profile.id,
        food_item_id: itemId,
        quantity_requested: quantityRequested,
        message: requestMessage || null,
        status: "pendiente",
      })

      if (requestError) throw requestError

      // Actualizar estado del alimento si se solicita toda la cantidad
      if (quantityRequested === foodItem.quantity) {
        await supabase.from("food_items").update({ status: "reservado" }).eq("id", itemId)
      }

      // Crear notificación para el beneficiario
      await supabase.from("notifications").insert({
        user_id: profile.id,
        title: "Solicitud enviada",
        message: `Has solicitado ${quantityRequested} ${foodItem.unit} de ${foodItem.name}`,
        type: "solicitud",
        action_url: `/alimentos/${itemId}`,
      })

      // Crear notificación para el donante
      if (foodItem.donor_id) {
        await supabase.from("notifications").insert({
          user_id: foodItem.donor_id,
          title: "Nueva solicitud de alimento",
          message: `${profile.full_name || "Alguien"} ha solicitado tu donación: ${foodItem.name}`,
          type: "solicitud",
          action_url: `/alimentos/${itemId}`,
        })
      }

      toast({
        title: "¡Solicitud enviada!",
        description: "El donante revisará tu solicitud pronto",
      })

      setRequestMessage("")
      setQuantityRequested(1)
      
      // Recargar después de un breve delay
      setTimeout(() => {
        loadFoodItem()
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error al enviar solicitud",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando alimento...</div>
  }

  if (!foodItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Alimento no encontrado</h3>
            <p className="text-gray-600 mb-4">Este alimento no existe o ha sido eliminado</p>
            <Button asChild>
              <Link href="/alimentos">Volver a Alimentos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDonor = profile?.id === foodItem.donor_id
  const canRequest = profile?.role === "beneficiario" && !isDonor && foodItem.status === "disponible"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/alimentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Alimentos
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              {foodItem.image_url ? (
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img src={foodItem.image_url} alt={foodItem.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(foodItem.status)}>
                      {foodItem.status === "disponible" && "Disponible"}
                      {foodItem.status === "reservado" && "Reservado"}
                      {foodItem.status === "entregado" && "Entregado"}
                      {foodItem.status === "expirado" && "Expirado"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-24 w-24 text-green-600 opacity-50" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(foodItem.status)}>
                      {foodItem.status === "disponible" && "Disponible"}
                      {foodItem.status === "reservado" && "Reservado"}
                      {foodItem.status === "entregado" && "Entregado"}
                      {foodItem.status === "expirado" && "Expirado"}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{foodItem.name}</CardTitle>
                    {foodItem.category && (
                      <Badge variant="outline" className="mt-2">
                        {foodItem.category.icon} {foodItem.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
                {foodItem.description && <CardDescription className="text-base mt-4">{foodItem.description}</CardDescription>}
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Cantidad */}
                  <div className="flex items-center text-gray-700">
                    <Package className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Cantidad Disponible</p>
                      <p className="text-sm text-gray-600">
                        {foodItem.quantity} {foodItem.unit}
                      </p>
                    </div>
                  </div>

                  {/* Fecha de expiración */}
                  {foodItem.expiry_date && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">Fecha de Expiración</p>
                        <p className="text-sm text-gray-600">{new Date(foodItem.expiry_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Ubicación */}
                  {foodItem.pickup_location && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">Ubicación de Recolección</p>
                        <p className="text-sm text-gray-600">{foodItem.pickup_location}</p>
                      </div>
                    </div>
                  )}

                  {/* Instrucciones especiales */}
                  {foodItem.special_instructions && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Instrucciones Especiales</p>
                        <p className="text-sm text-gray-600">{foodItem.special_instructions}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donante */}
            {foodItem.donor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Donante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={foodItem.donor.avatar_url} />
                        <AvatarFallback>{foodItem.donor.full_name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{foodItem.donor.full_name || "Sin nombre"}</p>
                        {foodItem.donor.organization_name && (
                          <p className="text-sm text-gray-500">{foodItem.donor.organization_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solicitar alimento */}
            {canRequest && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Solicitar Alimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad a solicitar</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={foodItem.quantity}
                        value={quantityRequested}
                        onChange={(e) => setQuantityRequested(parseInt(e.target.value) || 1)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">{foodItem.unit}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje (opcional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntale al donante por qué necesitas este alimento..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleRequestFood} disabled={requesting} className="w-full">
                    {requesting ? "Enviando solicitud..." : "Enviar Solicitud"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Acciones del donante */}
            {isDonor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/alimentos/${itemId}/editar`}>Editar Alimento</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
