import { supabase } from "./supabase"
import type { Profile } from "./supabase"

export interface NotificationPayload {
  user_id: string
  title: string
  message: string
  type: "donacion" | "solicitud" | "evento" | "campana" | "sistema"
  action_url?: string
}

/**
 * Envía una notificación al usuario si sus preferencias lo permiten
 */
export async function sendNotification(
  targetUserId: string,
  notification: Omit<NotificationPayload, "user_id">,
  userSettings?: any
) {
  try {
    // Si no tenemos las configuraciones del usuario, las obtenemos
    if (!userSettings) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", targetUserId)
        .single()

      userSettings = profile?.settings
    }

    // Verificar si el usuario tiene habilitadas notificaciones
    const notificationSettings = userSettings?.notifications || {}

    // Determinar si se debe enviar según el tipo
    let shouldSend = true

    switch (notification.type) {
      case "donacion":
        shouldSend = notificationSettings.donation_alerts !== false
        break
      case "evento":
        shouldSend = notificationSettings.event_invitations !== false
        break
      case "solicitud":
        shouldSend = notificationSettings.donation_alerts !== false
        break
      case "campana":
        shouldSend = notificationSettings.donation_alerts !== false
        break
      case "sistema":
        shouldSend = true // Las notificaciones de sistema siempre se envían
        break
    }

    if (!shouldSend) {
      console.log(
        `Notificación no enviada a ${targetUserId}: tipo ${notification.type} deshabilitado`
      )
      return null
    }

    // Crear la notificación
    const { data, error } = await supabase.from("notifications").insert({
      user_id: targetUserId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      action_url: notification.action_url,
      read: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating notification:", error)
      return null
    }

    // Si el usuario tiene notificaciones por email habilitadas, aquí se podría enviar un email
    if (notificationSettings.email_notifications) {
      await sendEmailNotification(targetUserId, notification)
    }

    // Si el usuario tiene notificaciones push habilitadas
    if (notificationSettings.push_notifications) {
      await sendPushNotification(targetUserId, notification)
    }

    return data
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}

/**
 * Envía una notificación por email
 */
async function sendEmailNotification(userId: string, notification: any) {
  try {
    // Aquí integraría con un servicio de email como SendGrid, Resend, etc.
    // Por ahora, solo registramos que se enviaría
    console.log(`Email notification would be sent to user ${userId}:`, notification)
  } catch (error) {
    console.error("Error sending email notification:", error)
  }
}

/**
 * Envía una notificación push
 */
async function sendPushNotification(userId: string, notification: any) {
  try {
    // Aquí integraría con Push Notifications
    console.log(`Push notification would be sent to user ${userId}:`, notification)
  } catch (error) {
    console.error("Error sending push notification:", error)
  }
}

/**
 * Obtiene notificaciones del usuario
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

/**
 * Obtiene el conteo de notificaciones no leídas
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return 0
  }
}
