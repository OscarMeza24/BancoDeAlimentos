"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth"
import { UsersManagement } from "@/components/admin/users-management"
import type { Profile } from "@/lib/supabase"

export default function UsuariosPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      // Solo administradores pueden acceder
      if (profileData?.role !== "administrador") {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      router.push("/auth")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile || profile.role !== "administrador") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">Solo administradores pueden acceder a esta sección</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra todos los usuarios del sistema</p>
        </div>

        <UsersManagement />
      </div>
    </div>
  )
}
