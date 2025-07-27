import { supabase } from "./supabase"
import type { Profile } from "./supabase"

export async function signUp(email: string, password: string, userData: Partial<Profile>) {
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

  if (error) throw error

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
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
