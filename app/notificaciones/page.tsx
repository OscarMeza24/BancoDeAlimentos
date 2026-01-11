'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, CheckCircle, AlertCircle, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from '@/lib/auth'
import {
  markNotificationAsRead,
  deleteNotification,
  getUserNotifications,
} from '@/lib/notifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notification {
  id: string
  title: string
  message: string
  type: 'donacion' | 'solicitud' | 'evento' | 'campana' | 'sistema'
  action_url?: string
  read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadProfileAndNotifications()
  }, [])

  async function loadProfileAndNotifications() {
    try {
      const userProfile = await getCurrentProfile()
      if (!userProfile) {
        router.push('/auth')
        return
      }

      setProfile(userProfile)

      const notifs = await getUserNotifications(userProfile.id, 100)
      setNotifications(notifs as Notification[])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    const success = await markNotificationAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    }
  }

  async function handleDelete(notificationId: string) {
    const success = await deleteNotification(notificationId)
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    }
  }

  function getTypeColor(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (type) {
      case 'donacion':
        return 'default'
      case 'solicitud':
        return 'secondary'
      case 'evento':
        return 'outline'
      case 'campana':
        return 'secondary'
      case 'sistema':
        return 'destructive'
      default:
        return 'default'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'donacion':
        return <CheckCircle className="h-4 w-4" />
      case 'solicitud':
        return <AlertCircle className="h-4 w-4" />
      case 'evento':
        return <Bell className="h-4 w-4" />
      case 'campana':
        return <Bell className="h-4 w-4" />
      case 'sistema':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'donacion':
        return 'Donación'
      case 'solicitud':
        return 'Solicitud'
      case 'evento':
        return 'Evento'
      case 'campana':
        return 'Campaña'
      case 'sistema':
        return 'Sistema'
      default:
        return 'Notificación'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <p className="text-gray-600 mt-2">
          {notifications.filter((n) => !n.read).length} sin leer
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.read ? 'border-primary bg-primary/5' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <Badge variant={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{notification.title}</h3>
                    <p className="text-gray-700 mb-3">{notification.message}</p>

                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        locale: es,
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {notification.action_url && (
                      <Link href={notification.action_url}>
                        <Button size="sm" variant="default">
                          Ver
                        </Button>
                      </Link>
                    )}

                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marcar como leído
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
