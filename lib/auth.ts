import { supabase, checkSupabaseConnection } from "./supabase"
import type { Profile } from "./supabase"

// Función auxiliar para manejar errores de autenticación
function handleAuthError(error: any): string {
  if (error.message?.includes('Timeout')) {
    return 'La conexión está tardando demasiado. Verifica tu conexión a internet.'
  }
  
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Error de conexión. Verifica tu conexión a internet.'
  }
  
  if (error.message?.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Debes confirmar tu email antes de iniciar sesión.'
  }
  
  if (error.message?.includes('User already registered')) {
    return 'Este email ya está registrado.'
  }
  
  return error.message || 'Error al procesar la solicitud.'
}

export async function signUp(email: string, password: string, userData: Partial<Profile>) {
  // Verificar conectividad primero
  const isConnected = await checkSupabaseConnection()
  if (!isConnected) {
    throw new Error('No se puede conectar con el servidor. Verifica tu conexión a internet.')
  }

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
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        ...userData,
        email,
      })
      .eq("id", data.user.id)

    if (profileError) throw profileError
  }

  return data
}

export async function signIn(email: string, password: string) {
  // Verificar conectividad primero
  const isConnected = await checkSupabaseConnection()
  if (!isConnected) {
    throw new Error('No se puede conectar con el servidor. Verifica tu conexión a internet.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(handleAuthError(error))
  return data
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
