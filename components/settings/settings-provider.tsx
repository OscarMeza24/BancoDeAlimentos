"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

interface Settings {
  notifications: {
    email_notifications: boolean
    push_notifications: boolean
    donation_alerts: boolean
    event_invitations: boolean
    weekly_digest: boolean
    marketing_emails: boolean
  }
  privacy: {
    profile_visible: boolean
    show_donations: boolean
    show_location: boolean
    allow_messages: boolean
  }
  preferences: {
    language: string
    theme: string
    timezone: string
  }
}

interface PartialSettings {
  notifications?: Partial<Settings["notifications"]>
  privacy?: Partial<Settings["privacy"]>
  preferences?: Partial<Settings["preferences"]>
}

interface SettingsContextType {
  settings: Settings | null
  profile: Profile | null
  loading: boolean
  updateNotificationSettings: (notifications: Settings["notifications"]) => Promise<void>
  updatePrivacySettings: (privacy: Settings["privacy"]) => Promise<void>
  updatePreferences: (preferences: Settings["preferences"]) => Promise<void>
  applyTheme: (theme: string) => void
  getLocalizedDate: (date: string | Date) => string
  isProfileVisible: (targetUserId: string) => boolean
  canSeeUserDonations: (targetUserId: string) => boolean
  canSeeUserLocation: (targetUserId: string) => boolean
  canMessageUser: (targetUserId: string) => boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    email_notifications: true,
    push_notifications: false,
    donation_alerts: true,
    event_invitations: true,
    weekly_digest: true,
    marketing_emails: false,
  },
  privacy: {
    profile_visible: true,
    show_donations: true,
    show_location: true,
    allow_messages: true,
  },
  preferences: {
    language: "es",
    theme: "light",
    timezone: "America/Mexico_City",
  },
}

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTheme } = useTheme()

  // Cargar configuraciones al montar
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      if (profileData) {
        const userSettings = profileData.settings || DEFAULT_SETTINGS
        const newSettings: Settings = {
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(userSettings.notifications || {}) },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...(userSettings.privacy || {}) },
          preferences: { ...DEFAULT_SETTINGS.preferences, ...(userSettings.preferences || {}) },
        }
        setSettings(newSettings)

        // Aplicar tema
        applyTheme(userSettings.preferences?.theme || "light")
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }, [])

  const applyTheme = (theme: string) => {
    if (theme === "auto") {
      setTheme("system")
    } else {
      setTheme(theme === "dark" ? "dark" : "light")
    }
  }

  const updateSettings = useCallback(
    async (newSettings: PartialSettings) => {
      if (!profile || !settings) return

      try {
        const updatedSettings: Settings = {
          notifications: { ...settings.notifications, ...newSettings.notifications },
          privacy: { ...settings.privacy, ...newSettings.privacy },
          preferences: { ...settings.preferences, ...newSettings.preferences },
        }

        const { error } = await supabase
          .from("profiles")
          .update({ settings: updatedSettings })
          .eq("id", profile.id)

        if (error) throw error

        setSettings(updatedSettings)

        // Aplicar tema si cambió
        if (newSettings.preferences?.theme) {
          applyTheme(newSettings.preferences.theme)
        }
      } catch (error) {
        console.error("Error updating settings:", error)
        throw error
      }
    },
    [profile, settings]
  )

  const updateNotificationSettings = useCallback(
    async (notifications: Settings["notifications"]) => {
      await updateSettings({
        notifications,
      })
    },
    [updateSettings]
  )

  const updatePrivacySettings = useCallback(
    async (privacy: Settings["privacy"]) => {
      await updateSettings({
        privacy,
      })
    },
    [updateSettings]
  )

  const updatePreferences = useCallback(
    async (preferences: Settings["preferences"]) => {
      await updateSettings({
        preferences,
      })
    },
    [updateSettings]
  )

  const getLocalizedDate = useCallback(
    (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date
      const timezone = settings?.preferences?.timezone || "America/Mexico_City"
      const language = settings?.preferences?.language || "es"

      try {
        return new Intl.DateTimeFormat(language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-ES", {
          timeZone: timezone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(dateObj)
      } catch (error) {
        return dateObj.toLocaleString()
      }
    },
    [settings?.preferences?.language, settings?.preferences?.timezone]
  )

  const isProfileVisible = useCallback(
    (targetUserId: string) => {
      if (!profile) return false
      if (profile.id === targetUserId) return true

      // Obtener settings del usuario target desde el contexto global
      return settings?.privacy?.profile_visible ?? true
    },
    [profile, settings?.privacy?.profile_visible]
  )

  const canSeeUserDonations = useCallback(
    (targetUserId: string) => {
      if (!profile) return false
      if (profile.id === targetUserId) return true

      return settings?.privacy?.show_donations ?? true
    },
    [profile, settings?.privacy?.show_donations]
  )

  const canSeeUserLocation = useCallback(
    (targetUserId: string) => {
      if (!profile) return false
      if (profile.id === targetUserId) return true

      return settings?.privacy?.show_location ?? true
    },
    [profile, settings?.privacy?.show_location]
  )

  const canMessageUser = useCallback(
    (targetUserId: string) => {
      if (!profile) return false

      return settings?.privacy?.allow_messages ?? true
    },
    [profile, settings?.privacy?.allow_messages]
  )

  const value: SettingsContextType = {
    settings,
    profile,
    loading,
    updateNotificationSettings,
    updatePrivacySettings,
    updatePreferences,
    applyTheme,
    getLocalizedDate,
    isProfileVisible,
    canSeeUserDonations,
    canSeeUserLocation,
    canMessageUser,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
