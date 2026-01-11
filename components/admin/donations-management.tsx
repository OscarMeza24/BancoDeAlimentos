"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Donation {
  id: string
  donor_id: string
  food_type: string
  quantity: number
  unit: string
  status: string
  created_at: string
  donor_name?: string
  donor_email?: string
}

export function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("food_items")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })

      if (error) throw error

      const mappedDonations: Donation[] = (data || []).map((item: any) => ({
        id: item.id,
        donor_id: item.donor_id,
        food_type: item.food_type,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        created_at: item.created_at,
        donor_name: item.profiles?.full_name,
        donor_email: item.profiles?.email,
      }))

      setDonations(mappedDonations)
    } catch (error) {
      console.error("Error loading donations:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las donaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setUpdating(id)
      const { error } = await supabase.from("food_items").update({ status: "disponible" }).eq("id", id)

      if (error) throw error

      setDonations(donations.map((d) => (d.id === id ? { ...d, status: "disponible" } : d)))

      toast({
        title: "Éxito",
        description: "Donación aprobada",
      })
    } catch (error) {
      console.error("Error approving donation:", error)
      toast({
        title: "Error",
        description: "No se pudo aprobar la donación",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setUpdating(id)
      const { error } = await supabase.from("food_items").update({ status: "rechazada" }).eq("id", id)

      if (error) throw error

      setDonations(donations.map((d) => (d.id === id ? { ...d, status: "rechazada" } : d)))

      toast({
        title: "Éxito",
        description: "Donación rechazada",
      })
    } catch (error) {
      console.error("Error rejecting donation:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar la donación",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      case "distribuida":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando donaciones...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Donaciones</CardTitle>
          <CardDescription>Supervisa y aprueba donaciones de alimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tipo de Alimento</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Donante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay donaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">{donation.food_type}</TableCell>
                      <TableCell>
                        {donation.quantity} {donation.unit}
                      </TableCell>
                      <TableCell>{donation.donor_name || "Anónimo"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(donation.status)}>{donation.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDonation(donation)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {donation.status === "pendiente" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(donation.id)}
                              disabled={updating === donation.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(donation.id)}
                              disabled={updating === donation.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
              <p className="text-sm text-gray-600">Total donaciones</p>
              <p className="text-2xl font-bold">{donations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{donations.filter((d) => d.status === "pendiente").length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{donations.filter((d) => d.status === "disponible").length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Distribuidas</p>
              <p className="text-2xl font-bold text-blue-600">{donations.filter((d) => d.status === "distribuida").length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de Donación</DialogTitle>
            <DialogDescription>Información completa de la donación</DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tipo de alimento</p>
                <p className="font-medium">{selectedDonation.food_type}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cantidad</p>
                  <p className="font-medium">
                    {selectedDonation.quantity} {selectedDonation.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge className={getStatusColor(selectedDonation.status)}>{selectedDonation.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Donante</p>
                <p className="font-medium">{selectedDonation.donor_name || "Anónimo"}</p>
                <p className="text-sm">{selectedDonation.donor_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de registro</p>
                <p className="font-medium">{new Date(selectedDonation.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
