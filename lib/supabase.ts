import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ CONFIGURACIÓN FALTANTE: Variables de entorno de Supabase no configuradas.\n' +
    'Por favor, crea un archivo .env.local con:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=tu-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave'
  )
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options = {}) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: La conexión está tardando demasiado')), 30000)
        ),
      ]) as Promise<Response>
    },
  },
})

// Función para verificar conectividad con Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Usar un timeout más generoso (10 segundos)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    // Intentar una operación simple de autenticación para verificar conectividad
    const testPromise = supabase.auth.getSession()
    
    await testPromise
    clearTimeout(timeoutId)
    return true
  } catch (error: any) {
    console.error('Error al verificar conexión con Supabase:', error)
    
    // Si es timeout o error de red, retornar false
    // En otros casos, asumimos que el servidor está disponible pero hay otro error
    if (error?.message?.includes('timeout') || error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
      return false
    }
    
    // Otros errores no son de conectividad
    return true
  }
}

// Tipos de datos
export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  role: "donante" | "beneficiario" | "administrador" | "voluntario"
  organization_name?: string
  organization_type?: string
  is_verified: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
  settings?: {
    notifications?: {
      email_notifications: boolean
      push_notifications: boolean
      donation_alerts: boolean
      event_invitations: boolean
      weekly_digest: boolean
      marketing_emails: boolean
    }
    privacy?: {
      profile_visible: boolean
      show_donations: boolean
      show_location: boolean
      allow_messages: boolean
    }
    preferences?: {
      language: string
      theme: string
      timezone: string
    }
  }
}

export interface FoodCategory {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
}

export interface FoodItem {
  id: string
  donor_id: string
  category_id: string
  name: string
  description?: string
  quantity: number
  unit: string
  expiry_date?: string
  pickup_location?: string
  pickup_latitude?: number
  pickup_longitude?: number
  status: "disponible" | "reservado" | "entregado" | "expirado"
  image_url?: string
  special_instructions?: string
  created_at: string
  updated_at: string
  category?: FoodCategory
  donor?: Profile
}

export interface FoodRequest {
  id: string
  beneficiary_id: string
  food_item_id: string
  quantity_requested: number
  status: "pendiente" | "aprobada" | "rechazada" | "completada"
  message?: string
  pickup_date?: string
  created_at: string
  updated_at: string
  food_item?: FoodItem
  beneficiary?: Profile
}

export interface Campaign {
  id: string
  title: string
  description?: string
  goal_amount?: number
  current_amount: number
  start_date: string
  end_date?: string
  status: "activa" | "pausada" | "completada" | "cancelada"
  image_url?: string
  created_by?: string
  created_at: string
}

export interface VolunteerEvent {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  latitude?: number
  longitude?: number
  max_volunteers?: number
  registered_volunteers: number
  status: "programado" | "en_curso" | "completado" | "cancelado"
  created_by?: string
  created_at: string
  category?: string
  required_materials?: string
  meeting_point?: string
  creator?: {
    id: string
    full_name?: string
    avatar_url?: string
  }
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "donacion" | "solicitud" | "evento" | "campana" | "sistema"
  read: boolean
  action_url?: string
  created_at: string
}