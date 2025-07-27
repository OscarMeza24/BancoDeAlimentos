"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin, Plus, Heart, Calendar } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, FoodItem, FoodCategory } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function AlimentosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterItems()
  }, [searchTerm, selectedCategory, statusFilter])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await Promise.all([loadFoodItems(profileData), loadCategories()])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadFoodItems = async (profile: Profile | null) => {
    try {
      let query = supabase
        .from("food_items")
        .select(`
          *,
          category:food_categories(name, icon),
          donor:profiles(full_name, city)
        `)
        .order("created_at", { ascending: false })

      // Si es donante, mostrar sus propios alimentos
      // Si es beneficiario, mostrar solo alimentos disponibles
      if (profile?.role === "donante") {
        query = query.eq("donor_id", profile.id)
      } else {
        query = query.eq("status", "disponible")
      }

      const { data, error } = await query

      if (error) throw error
      setFoodItems(data || [])
    } catch (error) {
      console.error("Error loading food items:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("food_categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const filterItems = () => {
    let filtered = foodItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category_id === selectedCategory)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    return filtered
  }

  const handleRequestFood = async (foodItemId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("food_requests").insert({
        beneficiary_id: profile.id,
        food_item_id: foodItemId,
        quantity_requested: 1,
        message: "Solicitud desde la plataforma",
      })

      if (error) throw error

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada al donante",
      })

      // Actualizar el estado del alimento a reservado
      await supabase.from("food_items").update({ status: "reservado" }).eq("id", foodItemId)

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

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredItems = filterItems()

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.role === "donante" ? "Mis Donaciones" : "Alimentos Disponibles"}
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === "donante"
                ? "Gestiona tus donaciones de alimentos"
                : "Encuentra alimentos disponibles en tu comunidad"}
            </p>
          </div>

          {profile?.role === "donante" && (
            <Button asChild>
              <Link href="/alimentos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Donar Alimentos
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {profile?.role === "donante" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {profile?.role === "donante" ? "No has registrado donaciones aún" : "No hay alimentos disponibles"}
              </h3>
              <p className="text-gray-600 mb-4">
                {profile?.role === "donante"
                  ? "Comienza a donar alimentos y ayuda a tu comunidad"
                  : "Intenta ajustar los filtros o vuelve más tarde"}
              </p>
              {profile?.role === "donante" && (
                <Button asChild>
                  <Link href="/alimentos/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Donar Alimentos
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {item.category?.icon || "🍽️"}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="text-right text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  {item.description && <CardDescription>{item.description}</CardDescription>}
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Donor info for beneficiaries */}
                    {profile?.role !== "donante" && item.donor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Donado por {item.donor.full_name}
                        {item.donor.city && ` • ${item.donor.city}`}
                      </div>
                    )}

                    {/* Location */}
                    {item.pickup_location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {item.pickup_location}
                      </div>
                    )}

                    {/* Expiry date */}
                    {item.expiry_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Vence: {new Date(item.expiry_date).toLocaleDateString()}</span>
                        {(() => {
                          const daysLeft = getDaysUntilExpiry(item.expiry_date)
                          if (daysLeft <= 3 && daysLeft > 0) {
                            return (
                              <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                                {daysLeft} día{daysLeft !== 1 ? "s" : ""}
                              </Badge>
                            )
                          } else if (daysLeft <= 0) {
                            return (
                              <Badge variant="outline" className="ml-2 text-red-600 border-red-600">
                                Expirado
                              </Badge>
                            )
                          }
                          return null
                        })()}
                      </div>
                    )}

                    {/* Special instructions */}
                    {item.special_instructions && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Instrucciones:</strong> {item.special_instructions}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      {profile?.role === "beneficiario" && item.status === "disponible" && (
                        <Button onClick={() => handleRequestFood(item.id)} className="w-full">
                          Solicitar Alimento
                        </Button>
                      )}

                      {profile?.role === "donante" && (
                        <div className="flex space-x-2">
                          <Button asChild variant="outline" className="flex-1 bg-transparent">
                            <Link href={`/alimentos/${item.id}`}>Ver Detalles</Link>
                          </Button>
                          {item.status === "disponible" && (
                            <Button asChild variant="outline" className="flex-1 bg-transparent">
                              <Link href={`/alimentos/${item.id}/editar`}>Editar</Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
