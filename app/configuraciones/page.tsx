"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Bell, 
  Lock, 
  User, 
  Eye, 
  Globe, 
  Smartphone, 
  Mail,
  AlertCircle,
  CheckCircle,
  Package
} from "lucide-react"
import { useSettings } from "@/components/settings/settings-provider"
import { toast } from "@/hooks/use-toast"

export default function ConfiguracionesPage() {
  const { settings, profile, loading, updateNotificationSettings, updatePrivacySettings, updatePreferences } = useSettings()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Estado local para formularios
  const [notificationSettings, setNotificationSettings] = useState(
    settings?.notifications || {
      email_notifications: true,
      push_notifications: false,
      donation_alerts: true,
      event_invitations: true,
      weekly_digest: true,
      marketing_emails: false,
    }
  )
  const [privacySettings, setPrivacySettings] = useState(
    settings?.privacy || {
      profile_visible: true,
      show_donations: true,
      show_location: true,
      allow_messages: true,
    }
  )
  const [preferences, setPreferences] = useState(
    settings?.preferences || {
      language: "es",
      theme: "light",
      timezone: "America/Mexico_City",
    }
  )
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setNotificationSettings(settings.notifications || {})
      setPrivacySettings(settings.privacy || {})
      setPreferences(settings.preferences || {})
    }
  }, [settings])

  const handleSaveNotifications = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updateNotificationSettings(notificationSettings)
      setSaveSuccess(true)
      toast({
        title: "Éxito",
        description: "Configuración de notificaciones guardada",
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updatePrivacySettings(privacySettings)
      setSaveSuccess(true)
      toast({
        title: "Éxito",
        description: "Configuración de privacidad guardada",
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updatePreferences(preferences)
      setSaveSuccess(true)
      toast({
        title: "Éxito",
        description: "Preferencias guardadas correctamente",
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar las preferencias",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordLoading(true)
    try {
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive",
        })
        setPasswordLoading(false)
        return
      }

      if (passwordForm.new_password.length < 6) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 6 caracteres",
          variant: "destructive",
        })
        setPasswordLoading(false)
        return
      }

      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new_password,
      })

      if (error) throw error

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })

      toast({
        title: "Éxito",
        description: "Contraseña actualizada correctamente",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">Administra tu cuenta y preferencias</p>
        </div>

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Los cambios han sido guardados correctamente
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="notificaciones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notificaciones" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="privacidad" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidad</span>
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Preferencias</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>

          {/* NOTIFICACIONES */}
          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Controla cómo y cuándo deseas recibir notificaciones. Los cambios se aplican inmediatamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Notificaciones por Email</Label>
                        <p className="text-sm text-gray-600">Recibe notificaciones en tu correo</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_notifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Notificaciones Push</Label>
                        <p className="text-sm text-gray-600">Recibe notificaciones en tu navegador</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          push_notifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Alertas de Donaciones</Label>
                        <p className="text-sm text-gray-600">Notificaciones sobre nuevas donaciones</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.donation_alerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          donation_alerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Invitaciones a Eventos</Label>
                        <p className="text-sm text-gray-600">Notificaciones de eventos cercanos</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.event_invitations}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          event_invitations: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Resumen Semanal</Label>
                        <p className="text-sm text-gray-600">Recibe un resumen de tu actividad semanal</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.weekly_digest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weekly_digest: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Emails de Marketing</Label>
                        <p className="text-sm text-gray-600">Recibe ofertas y actualizaciones de la plataforma</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.marketing_emails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          marketing_emails: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIVACIDAD */}
          <TabsContent value="privacidad">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Configuración de Privacidad
                </CardTitle>
                <CardDescription>
                  Controla quién puede ver tu información y datos. Los cambios son inmediatos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Perfil Visible</Label>
                        <p className="text-sm text-gray-600">Otros usuarios pueden ver tu perfil</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.profile_visible}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profile_visible: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Mostrar Donaciones</Label>
                        <p className="text-sm text-gray-600">Mostrar tu historial de donaciones públicamente</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.show_donations}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          show_donations: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Mostrar Ubicación</Label>
                        <p className="text-sm text-gray-600">Compartir tu ubicación aproximada</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.show_location}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          show_location: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Permitir Mensajes</Label>
                        <p className="text-sm text-gray-600">Otros usuarios pueden enviarte mensajes privados</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allow_messages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allow_messages: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSavePrivacy}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCIAS */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferencias Generales
                </CardTitle>
                <CardDescription>
                  Personaliza tu experiencia en la plataforma. Los cambios se aplican inmediatamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={preferences.language} onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Idioma para la interfaz de usuario</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={preferences.theme} onValueChange={(value) =>
                      setPreferences({ ...preferences, theme: value })
                    }>
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="auto">Automático (según sistema)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Tema visual de la plataforma</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select value={preferences.timezone} onValueChange={(value) =>
                      setPreferences({ ...preferences, timezone: value })
                    }>
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                        <SelectItem value="America/Denver">Denver (GMT-7)</SelectItem>
                        <SelectItem value="America/Chicago">Chicago (GMT-6)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                        <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Caracas">Caracas (GMT-4)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Usado para mostrar fechas y horas en tu zona local</p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El tema se aplicará inmediatamente. Los cambios de idioma se mostrarán en tu próxima sesión.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEGURIDAD */}
          <TabsContent value="seguridad">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Seguridad de la Cuenta
                </CardTitle>
                <CardDescription>
                  Mantén tu cuenta segura. Te recomendamos cambiar tu contraseña regularmente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tu cuenta está protegida. Usa una contraseña fuerte y única.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Contraseña Actual</Label>
                    <Input
                      id="current_password"
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nueva Contraseña</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Ingresa una nueva contraseña"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-gray-600">
                      Mínimo 6 caracteres. Usa combinación de letras, números y símbolos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirma tu nueva contraseña"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !passwordForm.new_password}
                  className="w-full sm:w-auto"
                  variant="destructive"
                >
                  {passwordLoading ? "Actualizando..." : "Cambiar Contraseña"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
