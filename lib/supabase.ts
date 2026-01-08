import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
          setTimeout(() => reject(new Error('Timeout: La conexión está tardando demasiado')), 15000)
        ),
      ]) as Promise<Response>
    },
  },
})

// Función para verificar conectividad con Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    // Intentar una operación simple de autenticación para verificar conectividad
    const testPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 5000)
    )
    
    await Promise.race([testPromise, timeoutPromise])
    clearTimeout(timeoutId)
    return true
  } catch (error: any) {
    // Si es timeout o error de red, retornar false
    if (error?.message?.includes('timeout') || error?.message?.includes('fetch')) {
      return false
    }
    // Otros errores (como auth errors) significan que el servidor está respondiendo
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
