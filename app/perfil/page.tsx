"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Phone, Mail, Building, Save, Upload, Heart, Gift, Calendar } from "lucide-react"
import { getCurrentProfile, updateProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalRequests: 0,
    eventsParticipated: 0,
    moneyDonated: 0,
  })

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    organization_name: "",
    organization_type: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      if (profileData) {
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          postal_code: profileData.postal_code || "",
          organization_name: profileData.organization_name || "",
          organization_type: profileData.organization_type || "",
        })

        await loadUserStats(profileData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (profile: Profile) => {
    try {
      const [donationsResult, requestsResult, eventsResult, moneyResult] = await Promise.all([
        // Donaciones realizadas
        supabase
          .from("food_items")
          .select("id", { count: "exact" })
          .eq("donor_id", profile.id),

        // Solicitudes realizadas
        supabase
          .from("food_requests")
          .select("id", { count: "exact" })
          .eq("beneficiary_id", profile.id),

        // Eventos en los que participó
        supabase
          .from("event_participants")
          .select("id", { count: "exact" })
          .eq("volunteer_id", profile.id),

        // Dinero donado
        supabase
          .from("monetary_donations")
          .select("amount")
          .eq("donor_id", profile.id)
          .eq("status", "completada"),
      ])

      const totalMoney = moneyResult.data?.reduce((sum, donation) => sum + donation.amount, 0) || 0

      setStats({
        totalDonations: donationsResult.count || 0,
        totalRequests: requestsResult.count || 0,
        eventsParticipated: eventsResult.count || 0,
        moneyDonated: totalMoney,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
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

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile?.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)

    try {
      let avatarUrl = profile.avatar_url

      // Subir nueva imagen si se seleccionó
      if (imageFile) {
        const uploadedUrl = await uploadAvatar(imageFile)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Actualizar perfil
      const updatedProfile = await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
      })

      setProfile(updatedProfile)
      setImageFile(null)
      setImagePreview(null)

      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "donante":
        return "bg-green-100 text-green-800"
      case "beneficiario":
        return "bg-blue-100 text-blue-800"
      case "voluntario":
        return "bg-purple-100 text-purple-800"
      case "administrador":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando perfil...</div>
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Error al cargar el perfil</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={imagePreview || profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name || ""}
                      />
                      <AvatarFallback className="text-2xl">
                        {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button size="sm" className="rounded-full h-8 w-8 p-0" asChild>
                          <span>
                            <Upload className="h-4 w-4" />
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                  <CardTitle>{profile.full_name || "Usuario"}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                  <Badge className={`w-fit mx-auto mt-2 ${getRoleBadgeColor(profile.role)}`}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {profile.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.phone}
                      </div>
                    )}
                    {profile.city && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.city}
                        {profile.state && `, ${profile.state}`}
                      </div>
                    )}
                    {profile.organization_name && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.organization_name}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      Verificado: {profile.is_verified ? "Sí" : "No"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información de contacto y detalles del perfil</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Información básica */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Nombre completo</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="Tu número de teléfono"
                          />
                        </div>
                      </div>

                      {/* Dirección */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="Tu dirección completa"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Ciudad"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">Estado/Provincia</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                              placeholder="Estado"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Código Postal</Label>
                            <Input
                              id="postal_code"
                              value={formData.postal_code}
                              onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
                              placeholder="CP"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Información de organización (solo para beneficiarios) */}
                      {profile.role === "beneficiario" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="organization_name">Nombre de la organización (opcional)</Label>
                            <Input
                              id="organization_name"
                              value={formData.organization_name}
                              onChange={(e) => setFormData((prev) => ({ ...prev, organization_name: e.target.value }))}
                              placeholder="Nombre de tu organización"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="organization_type">Tipo de organización</Label>
                            <Select
                              value={formData.organization_type}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, organization_type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fundacion">Fundación</SelectItem>
                                <SelectItem value="ong">ONG</SelectItem>
                                <SelectItem value="iglesia">Iglesia</SelectItem>
                                <SelectItem value="escuela">Escuela</SelectItem>
                                <SelectItem value="centro_comunitario">Centro Comunitario</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <Button type="submit" disabled={saving} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {profile.role === "donante" ? "Donaciones Realizadas" : "Solicitudes Realizadas"}
                  </CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profile.role === "donante" ? stats.totalDonations : stats.totalRequests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === "donante" ? "Alimentos donados" : "Alimentos solicitados"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Participados</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.eventsParticipated}</div>
                  <p className="text-xs text-muted-foreground">Eventos de voluntariado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dinero Donado</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.moneyDonated.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">En campañas solidarias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impacto Total</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalDonations + stats.totalRequests + stats.eventsParticipated}
                  </div>
                  <p className="text-xs text-muted-foreground">Acciones realizadas</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tu Impacto en la Comunidad</CardTitle>
                <CardDescription>Resumen de tu contribución al banco de alimentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Heart className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">¡Gracias por tu contribución!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {profile.role === "donante" && "Tus donaciones han ayudado a alimentar familias en tu comunidad."}
                      {profile.role === "beneficiario" &&
                        "Tu participación ayuda a reducir el desperdicio de alimentos."}
                      {profile.role === "voluntario" && "Tu tiempo y esfuerzo hacen la diferencia en la comunidad."}
                      {profile.role === "administrador" && "Tu gestión mantiene la plataforma funcionando para todos."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Cuenta</CardTitle>
                <CardDescription>Gestiona las preferencias de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Configuración avanzada en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
