import { useCallback } from "react"
import { useSettings } from "@/components/settings/settings-provider"

/**
 * Hook para trabajar con notificaciones respetando las preferencias del usuario
 */
export function useUserNotifications() {
  const { settings } = useSettings()

  const shouldSendNotification = useCallback(
    (type: "donacion" | "solicitud" | "evento" | "campana" | "sistema") => {
      if (!settings?.notifications) return true

      switch (type) {
        case "donacion":
          return settings.notifications.donation_alerts
        case "evento":
          return settings.notifications.event_invitations
        case "solicitud":
          return settings.notifications.donation_alerts
        case "campana":
          return settings.notifications.donation_alerts
        case "sistema":
          return true
        default:
          return true
      }
    },
    [settings?.notifications]
  )

  const canReceiveEmails = useCallback(
    () => settings?.notifications?.email_notifications ?? true,
    [settings?.notifications?.email_notifications]
  )

  const canReceivePush = useCallback(
    () => settings?.notifications?.push_notifications ?? false,
    [settings?.notifications?.push_notifications]
  )

  return {
    shouldSendNotification,
    canReceiveEmails,
    canReceivePush,
  }
}

/**
 * Hook para trabajar con privacidad
 */
export function usePrivacySettings() {
  const { settings } = useSettings()

  const isProfilePublic = useCallback(
    () => settings?.privacy?.profile_visible ?? true,
    [settings?.privacy?.profile_visible]
  )

  const areDonationsVisible = useCallback(
    () => settings?.privacy?.show_donations ?? true,
    [settings?.privacy?.show_donations]
  )

  const isLocationVisible = useCallback(
    () => settings?.privacy?.show_location ?? true,
    [settings?.privacy?.show_location]
  )

  const allowsMessages = useCallback(
    () => settings?.privacy?.allow_messages ?? true,
    [settings?.privacy?.allow_messages]
  )

  return {
    isProfilePublic,
    areDonationsVisible,
    isLocationVisible,
    allowsMessages,
  }
}

/**
 * Hook para trabajar con preferencias
 */
export function usePreferences() {
  const { settings, getLocalizedDate, applyTheme } = useSettings()

  const language = settings?.preferences?.language ?? "es"
  const theme = settings?.preferences?.theme ?? "light"
  const timezone = settings?.preferences?.timezone ?? "America/Mexico_City"

  const getTranslation = useCallback(
    (key: string) => {
      // Aquí irían las traducciones
      const translations: Record<string, Record<string, string>> = {
        es: {
          donacion: "Donación",
          solicitud: "Solicitud",
          evento: "Evento",
          campaña: "Campaña",
        },
        en: {
          donacion: "Donation",
          solicitud: "Request",
          evento: "Event",
          campaña: "Campaign",
        },
        pt: {
          donacion: "Doação",
          solicitud: "Solicitação",
          evento: "Evento",
          campaña: "Campanha",
        },
      }

      return translations[language]?.[key] ?? key
    },
    [language]
  )

  return {
    language,
    theme,
    timezone,
    getLocalizedDate,
    applyTheme,
    getTranslation,
  }
}
