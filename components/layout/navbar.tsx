"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Heart, Bell, User, Settings, LogOut, Menu, Home, Gift, Users, Calendar, MapPin, BarChart3 } from "lucide-react"
import { signOut, getCurrentProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Profile, Notification } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadProfile()
    loadNotifications()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getCurrentProfile()
      setProfile(profileData)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      loadNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard", label: "Inicio", icon: Home },
      { href: "/alimentos", label: "Alimentos", icon: Gift },
      { href: "/mapa", label: "Mapa", icon: MapPin },
      { href: "/eventos", label: "Eventos", icon: Calendar },
    ]

    if (profile?.role === "administrador") {
      baseItems.push(
        { href: "/admin", label: "Administración", icon: BarChart3 },
        { href: "/usuarios", label: "Usuarios", icon: Users },
      )
    }

    return baseItems
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "donante":
        return "bg-green-100 text-green-800"
      case "beneficiario":
        return "bg-blue-100 text-blue-800"
      case "voluntario":
        return "bg-purple-100 text-purple-800"
      case "administrador":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!profile) {
    return null
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-primary/10 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">Banco de Alimentos</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavItems().map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20" 
                      : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-primary/5 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-orange-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-display">Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-3 cursor-pointer transition-colors ${!notification.read ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                      onClick={() => {
                        markNotificationAsRead(notification.id)
                        if (notification.action_url) {
                          router.push(notification.action_url)
                        }
                      }}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-600">{notification.message}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                      {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-display">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold leading-none text-gray-900">{profile.full_name || "Usuario"}</p>
                    <p className="text-xs leading-none text-gray-500">{profile.email}</p>
                    <Badge className={`w-fit mt-2 font-medium ${
                      profile.role === "donante" ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary" :
                      profile.role === "beneficiario" ? "bg-blue-100 text-blue-700" :
                      profile.role === "voluntario" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="flex items-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuraciones" className="flex items-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <Settings className="mr-2 h-4 w-4 text-primary" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-red-50 transition-colors">
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-primary/5">
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
