"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, FoodCategory } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NuevoAlimentoPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    quantity: 1,
    unit: "unidades",
    expiry_date: undefined as Date | undefined,
    pickup_location: "",
    special_instructions: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      if (profileData?.role !== "donante") {
        router.push("/dashboard")
        return
      }

      // Cargar categorías
      const { data: categoriesData, error } = await supabase.from("food_categories").select("*").order("name")

      if (error) throw error
      setCategories(categoriesData || [])

      // Pre-llenar ubicación si está disponible
      if (profileData?.address) {
        setFormData((prev) => ({
          ...prev,
          pickup_location: profileData.address,
        }))
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `food-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("food-images").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("food-images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { error } = await supabase.from("food_items").insert({
        donor_id: profile.id,
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        quantity: formData.quantity,
        unit: formData.unit,
        expiry_date: formData.expiry_date?.toISOString().split("T")[0],
        pickup_location: formData.pickup_location,
        special_instructions: formData.special_instructions,
        image_url: imageUrl,
        status: "disponible",
      })

      if (error) throw error

      // Crear notificación para beneficiarios cercanos
      await supabase.from("notifications").insert({
        user_id: profile.id,
        title: "Nuevo alimento donado",
        message: `Has donado ${formData.name} exitosamente`,
        type: "donacion",
      })

      toast({
        title: "¡Donación registrada!",
        description: "Tu donación ha sido registrada exitosamente",
      })

      router.push("/alimentos")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donar Alimentos</h1>
          <p className="text-gray-600 mt-2">Registra los alimentos que quieres donar y ayuda a tu comunidad</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Alimento</CardTitle>
            <CardDescription>Completa los detalles del alimento que quieres donar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Imagen */}
              <div className="space-y-2">
                <Label>Imagen del alimento (opcional)</Label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 bg-transparent"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Seleccionar imagen</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del alimento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Manzanas rojas, Pan integral, etc."
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el estado, origen o características especiales del alimento"
                  rows={3}
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                  required
                >
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

              {/* Cantidad y Unidad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="kg">Kilogramos</SelectItem>
                      <SelectItem value="g">Gramos</SelectItem>
                      <SelectItem value="litros">Litros</SelectItem>
                      <SelectItem value="ml">Mililitros</SelectItem>
                      <SelectItem value="paquetes">Paquetes</SelectItem>
                      <SelectItem value="cajas">Cajas</SelectItem>
                      <SelectItem value="bolsas">Bolsas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fecha de vencimiento */}
              <div className="space-y-2">
                <Label>Fecha de vencimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiry_date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiry_date ? (
                        format(formData.expiry_date, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiry_date}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, expiry_date: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Ubicación de recogida */}
              <div className="space-y-2">
                <Label htmlFor="pickup_location">Ubicación de recogida *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pickup_location"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pickup_location: e.target.value }))}
                    placeholder="Dirección donde se puede recoger el alimento"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Instrucciones especiales */}
              <div className="space-y-2">
                <Label htmlFor="special_instructions">Instrucciones especiales</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Horarios de recogida, condiciones especiales, etc."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Registrando..." : "Registrar Donación"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
