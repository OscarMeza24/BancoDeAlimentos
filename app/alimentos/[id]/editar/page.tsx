"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Package, ArrowLeft } from "lucide-react"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, FoodItem, FoodCategory } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function EditarAlimentoPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    quantity: "1",
    unit: "unidades",
    expiry_date: "",
    pickup_location: "",
    status: "disponible" as "disponible" | "reservado" | "entregado" | "expirado",
    special_instructions: "",
    image_url: "",
  })

  useEffect(() => {
    loadData()
  }, [itemId])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      await Promise.all([loadFoodItem(profileData), loadCategories()])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
      router.push("/alimentos")
    } finally {
      setLoading(false)
    }
  }

  const loadFoodItem = async (profileData: Profile | null) => {
    try {
      const { data, error } = await supabase.from("food_items").select("*").eq("id", itemId).single()

      if (error) throw error

      // Verificar que el usuario sea el donante
      if (data.donor_id !== profileData?.id && profileData?.role !== "administrador") {
        toast({
          title: "Sin permisos",
          description: "No tienes permisos para editar este alimento",
          variant: "destructive",
        })
        router.push("/alimentos")
        return
      }

      setFormData({
        name: data.name,
        description: data.description || "",
        category_id: data.category_id || "",
        quantity: data.quantity.toString(),
        unit: data.unit || "unidades",
        expiry_date: data.expiry_date || "",
        pickup_location: data.pickup_location || "",
        status: data.status,
        special_instructions: data.special_instructions || "",
        image_url: data.image_url || "",
      })
    } catch (error) {
      console.error("Error loading food item:", error)
      throw error
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!profile) {
        throw new Error("Debes iniciar sesión")
      }

      // Validaciones
      if (!formData.name.trim()) {
        throw new Error("El nombre es obligatorio")
      }

      if (parseInt(formData.quantity) <= 0) {
        throw new Error("La cantidad debe ser mayor a 0")
      }

      // Actualizar alimento
      const { error } = await supabase
        .from("food_items")
        .update({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          expiry_date: formData.expiry_date || null,
          pickup_location: formData.pickup_location || null,
          status: formData.status,
          special_instructions: formData.special_instructions || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (error) throw error

      toast({
        title: "¡Alimento actualizado!",
        description: "Los cambios se han guardado exitosamente",
      })

      router.push(`/alimentos/${itemId}`)
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este alimento?")) {
      return
    }

    try {
      const { error } = await supabase.from("food_items").delete().eq("id", itemId)

      if (error) throw error

      toast({
        title: "Alimento eliminado",
        description: "El alimento ha sido eliminado exitosamente",
      })

      router.push("/alimentos")
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/alimentos/${itemId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Alimento
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Alimento</h1>
          <p className="text-gray-600 mt-2">Actualiza la información de tu donación</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Alimento</CardTitle>
            <CardDescription>Actualiza los detalles de tu donación</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre del Alimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Arroz, Frijoles, Pan, etc."
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el alimento, condición, etc."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Cantidad y Unidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Cantidad <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="kg">Kilogramos</SelectItem>
                      <SelectItem value="g">Gramos</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                      <SelectItem value="ml">Mililitros</SelectItem>
                      <SelectItem value="cajas">Cajas</SelectItem>
                      <SelectItem value="paquetes">Paquetes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fecha de expiración */}
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Fecha de Expiración</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleChange("expiry_date", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location">Ubicación de Recolección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pickup_location"
                    placeholder="Ej: Calle Principal 123, Ciudad"
                    value={formData.pickup_location}
                    onChange={(e) => handleChange("pickup_location", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Instrucciones especiales */}
              <div className="space-y-2">
                <Label htmlFor="special_instructions">Instrucciones Especiales</Label>
                <Textarea
                  id="special_instructions"
                  placeholder="Horarios de recolección, cuidados especiales, etc."
                  value={formData.special_instructions}
                  onChange={(e) => handleChange("special_instructions", e.target.value)}
                  rows={3}
                />
              </div>

              {/* URL de imagen */}
              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/alimentos/${itemId}`)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={submitting}>
                  Eliminar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
