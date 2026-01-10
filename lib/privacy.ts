import { supabase } from "./supabase"
import type { Profile } from "./supabase"

/**
 * Obtiene un perfil respetando las configuraciones de privacidad
 */
export async function getProfileWithPrivacyRules(
  userId: string,
  viewerId?: string
): Promise<Partial<Profile> | null> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !profile) return null

    // Si el que ve es el mismo usuario, mostrar todo
    if (viewerId === userId) {
      return profile
    }

    // Si el usuario es anónimo, respetar solo privacidad general
    const privacySettings = profile.settings?.privacy || {}

    const restrictedProfile: Partial<Profile> = {
      id: profile.id,
      full_name: privacySettings.profile_visible ? profile.full_name : "Usuario Privado",
      email: privacySettings.profile_visible ? profile.email : undefined,
      role: profile.role,
      created_at: profile.created_at,
      avatar_url: privacySettings.profile_visible ? profile.avatar_url : undefined,
    }

    // Agregar información de ubicación si se permite
    if (privacySettings.show_location) {
      restrictedProfile.latitude = profile.latitude
      restrictedProfile.longitude = profile.longitude
      restrictedProfile.address = profile.address
      restrictedProfile.city = profile.city
    }

    return restrictedProfile
  } catch (error) {
    console.error("Error fetching profile with privacy rules:", error)
    return null
  }
}

/**
 * Verifica si un usuario puede ver las donaciones de otro
 */
export async function canViewUserDonations(
  targetUserId: string,
  viewerId?: string
): Promise<boolean> {
  try {
    if (viewerId === targetUserId) return true

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", targetUserId)
      .single()

    if (error) return false

    return profile?.settings?.privacy?.show_donations !== false
  } catch (error) {
    console.error("Error checking donation visibility:", error)
    return false
  }
}

/**
 * Obtiene las donaciones de un usuario respetando privacidad
 */
export async function getUserDonationsWithPrivacy(
  userId: string,
  viewerId?: string
) {
  try {
    // Primero verificar si se pueden ver las donaciones
    const canView = await canViewUserDonations(userId, viewerId)

    if (!canView) {
      return []
    }

    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .eq("donor_id", userId)
      .eq("status", "disponible")

    if (error) return []
    return data || []
  } catch (error) {
    console.error("Error fetching user donations with privacy:", error)
    return []
  }
}

/**
 * Verifica si se puede enviar un mensaje a un usuario
 */
export async function canMessageUser(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", userId)
      .single()

    if (error) return false

    return profile?.settings?.privacy?.allow_messages !== false
  } catch (error) {
    console.error("Error checking message permission:", error)
    return false
  }
}

/**
 * Obtiene lista de usuarios filtrando por privacidad
 */
export async function getUsersWithPrivacy(
  options: {
    role?: string
    city?: string
    limit?: number
  } = {},
  viewerId?: string
) {
  try {
    let query = supabase.from("profiles").select("*")

    if (options.role) {
      query = query.eq("role", options.role)
    }

    if (options.city) {
      query = query.eq("city", options.city)
    }

    const { data: profiles, error } = await query.limit(options.limit || 50)

    if (error) return []

    // Filtrar usuarios que tienen perfil privado
    return (
      profiles
        ?.filter((profile) => {
          if (viewerId === profile.id) return true
          return profile.settings?.privacy?.profile_visible !== false
        })
        .map((profile) => {
          if (viewerId === profile.id) {
            return profile
          }

          const privacySettings = profile.settings?.privacy || {}
          const restrictedProfile: Partial<Profile> = {
            id: profile.id,
            full_name: privacySettings.profile_visible
              ? profile.full_name
              : "Usuario Privado",
            avatar_url: privacySettings.profile_visible ? profile.avatar_url : undefined,
            role: profile.role,
            city: privacySettings.profile_visible ? profile.city : undefined,
          }

          if (privacySettings.show_location) {
            restrictedProfile.latitude = profile.latitude
            restrictedProfile.longitude = profile.longitude
          }

          return restrictedProfile
        }) || []
    )
  } catch (error) {
    console.error("Error fetching users with privacy:", error)
    return []
  }
}

/**
 * Auditoría: registra cuándo alguien accede a datos privados
 */
export async function logPrivacyAccess(
  userId: string,
  accessedUserId: string,
  dataType: "profile" | "donations" | "location" | "contact"
) {
  try {
    // Aquí se podría logging a una tabla de auditoría
    console.log(
      `[PRIVACY_ACCESS] User ${userId} accessed ${dataType} of user ${accessedUserId}`
    )
  } catch (error) {
    console.error("Error logging privacy access:", error)
  }
}
