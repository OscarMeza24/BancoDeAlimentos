"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { sendNotification } from "@/lib/notifications"
import type { Profile } from "@/lib/supabase"

interface FoodRequest {
  id: string
  food_item_id: string
  beneficiary_id: string
  quantity_requested: number
  status: string
  message: string
  pickup_date: string | null
  created_at: string
  food_item_name?: string
  beneficiary_name?: string
  beneficiary_email?: string
}

interface DonorReceivedRequestsProps {
  profile: Profile | null
}

export function DonorReceivedRequests({ profile }: DonorReceivedRequestsProps) {
  const [requests, setRequests] = useState<FoodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.id) {
      loadReceivedRequests()
    }
  }, [profile?.id])

  const loadReceivedRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("food_requests")
        .select(`
          id,
          food_item_id,
          beneficiary_id,
          quantity_requested,
          status,
          message,
          pickup_date,
          created_at,
          food_item:food_items(name, donor_id),
          beneficiary:profiles(full_name, email)
        `)
        .eq("food_item.donor_id", profile?.id || "")
        .order("created_at", { ascending: false })

      if (error) throw error

      const mappedRequests: FoodRequest[] = (data || []).map((req: any) => ({
        id: req.id,
        food_item_id: req.food_item_id,
        beneficiary_id: req.beneficiary_id,
        quantity_requested: req.quantity_requested,
        status: req.status,
        message: req.message,
        pickup_date: req.pickup_date,
        created_at: req.created_at,
        food_item_name: req.food_item?.name,
        beneficiary_name: req.beneficiary?.full_name,
        beneficiary_email: req.beneficiary?.email,
      }))

      setRequests(mappedRequests)
    } catch (error) {
      console.error("Error loading received requests:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setUpdating(id)
      
      // Get request details before updating
      const request = requests.find(r => r.id === id)
      if (!request) return

      const { error } = await supabase.from("food_requests").update({ status: "aprobada" }).eq("id", id)

      if (error) throw error

      setRequests(requests.map((r) => (r.id === id ? { ...r, status: "aprobada" } : r)))

      // Send notification to beneficiary
      await sendNotification(
        request.beneficiary_id,
        {
          title: "Solicitud de alimento aprobada",
          message: `Tu solicitud de ${request.food_item_name} ha sido aprobada. Coordina el recojo con el donante.`,
          type: "solicitud",
          action_url: "/alimentos",
        }
      )

      toast({
        title: "Éxito",
        description: "Solicitud aprobada y notificación enviada",
      })
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setUpdating(id)
      
      // Get request details before updating
      const request = requests.find(r => r.id === id)
      if (!request) return

      const { error } = await supabase.from("food_requests").update({ status: "rechazada" }).eq("id", id)

      if (error) throw error

      setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rechazada" } : r)))

      // Send notification to beneficiary
      await sendNotification(
        request.beneficiary_id,
        {
          title: "Solicitud de alimento rechazada",
          message: `Tu solicitud de ${request.food_item_name} ha sido rechazada.`,
          type: "solicitud",
          action_url: "/alimentos",
        }
      )

      toast({
        title: "Éxito",
        description: "Solicitud rechazada y notificación enviada",
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      case "completada":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando solicitudes...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Recibidas</CardTitle>
          <CardDescription>Solicitudes de beneficiarios para tus donaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Alimento</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay solicitudes recibidas
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.food_item_name}</TableCell>
                      <TableCell>{request.beneficiary_name || "Anónimo"}</TableCell>
                      <TableCell>{request.quantity_requested} unidades</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={request.message || "Sin mensaje"}>
                            {request.message ? (
                              <span>{request.message.substring(0, 50)}{request.message.length > 50 ? "..." : ""}</span>
                            ) : (
                              <span className="text-gray-400 italic">Sin mensaje</span>
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRequest(request)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            {request.status === "pendiente" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(request.id)} disabled={updating === request.id}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(request.id)} disabled={updating === request.id}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Rechazar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-600">Total solicitudes</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{requests.filter((r) => r.status === "pendiente").length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{requests.filter((r) => r.status === "aprobada").length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-blue-600">{requests.filter((r) => r.status === "completada").length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>Información completa de la solicitud</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Alimento solicitado</p>
                <p className="font-medium">{selectedRequest.food_item_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solicitante</p>
                <p className="font-medium">{selectedRequest.beneficiary_name || "Anónimo"}</p>
                <p className="text-sm">{selectedRequest.beneficiary_email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cantidad solicitada</p>
                  <p className="font-medium">{selectedRequest.quantity_requested} unidades</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mensaje del solicitante</p>
                <p className="text-sm mt-1">{selectedRequest.message || "Sin mensaje adicional"}</p>
              </div>
              {selectedRequest.pickup_date && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de recogida propuesta</p>
                  <p className="font-medium">{new Date(selectedRequest.pickup_date).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Fecha de solicitud</p>
                <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
