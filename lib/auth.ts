import { supabase, checkSupabaseConnection } from "./supabase"
import type { Profile } from "./supabase"

// Función auxiliar para manejar errores de autenticación
function handleAuthError(error: any): string {
  const message = error.message || error.error_description || ''
  
  if (message.includes('Timeout')) {
    return 'La conexión está tardando demasiado. Verifica tu conexión a internet.'
  }
  
  if (message.includes('fetch') || message.includes('network')) {
    return 'Error de conexión. Verifica tu conexión a internet y la configuración de Supabase.'
  }
  
  if (message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
  }
  
  if (message.includes('User already registered')) {
    return 'Este email ya está registrado. Intenta iniciar sesión.'
  }
  
  if (message.includes('Unable to validate email address')) {
    return 'Email inválido. Verifica el formato.'
  }
  
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return '⚠️ Variables de entorno no configuradas. Revisa tu archivo .env.local'
  }
  
  return message || 'Error al procesar la solicitud.'
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function signUp(email: string, password: string, userData: Partial<Profile>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role || "donante",
        },
      },
    })

    if (error) throw new Error(handleAuthError(error))

    // Actualizar perfil con datos adicionales
    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          ...userData,
          email,
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Error actualizando perfil:', profileError)
      }
    }

    return data
  } catch (error: any) {
    throw new Error(handleAuthError(error))
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(handleAuthError(error))
    return data
  } catch (error: any) {
    throw new Error(handleAuthError(error))
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) throw error
  return data
}

export async function updateProfile(updates: Partial<Profile>) {
  const user = await getCurrentUser()
  if (!user) throw new Error("No user logged in")

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

  if (error) throw error
  return data
}

export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}
