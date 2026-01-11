"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Trash2, Edit2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  status: string
  created_at: string
  start_date: string
  end_date: string
}

export function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      goal_amount: "0",
      start_date: "",
      end_date: "",
    },
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setCampaigns(data || [])
    } catch (error) {
      console.error("Error loading campaigns:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: any) => {
    try {
      // Validar que la meta sea un número positivo
      const goalAmount = typeof values.goal_amount === "string" ? parseFloat(values.goal_amount) : values.goal_amount
      
      if (goalAmount <= 0) {
        toast({
          title: "Error",
          description: "La meta debe ser mayor a 0",
          variant: "destructive",
        })
        return
      }

      const submitData = {
        title: values.title,
        description: values.description,
        goal_amount: goalAmount,
        start_date: values.start_date,
        end_date: values.end_date,
      }

      if (editingId) {
        const { error } = await supabase.from("campaigns").update(submitData).eq("id", editingId)
        if (error) throw error

        setCampaigns(campaigns.map((c) => (c.id === editingId ? { ...c, ...submitData } : c)))
        toast({
          title: "Éxito",
          description: "Campaña actualizada correctamente",
        })
      } else {
        const { data, error } = await supabase
          .from("campaigns")
          .insert([{ ...submitData, current_amount: 0, status: "activa" }])
          .select()

        if (error) throw error

        setCampaigns([...(data || []), ...campaigns])
        toast({
          title: "Éxito",
          description: "Campaña creada correctamente",
        })
      }

      form.reset()
      setShowDialog(false)
      setEditingId(null)
    } catch (error) {
      console.error("Error saving campaign:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la campaña",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (campaign: Campaign) => {
    form.reset({
      title: campaign.title,
      description: campaign.description,
      goal_amount: campaign.goal_amount.toString(),
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    })
    setEditingId(campaign.id)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta campaña?")) return

    try {
      setDeleting(id)
      const { error } = await supabase.from("campaigns").delete().eq("id", id)

      if (error) throw error

      setCampaigns(campaigns.filter((c) => c.id !== id))
      toast({
        title: "Éxito",
        description: "Campaña eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la campaña",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activa":
        return "bg-green-100 text-green-800"
      case "completada":
        return "bg-blue-100 text-blue-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressPercentage = (campaign: Campaign) => {
    return Math.min(100, (campaign.current_amount / campaign.goal_amount) * 100)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando campañas...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Campañas</CardTitle>
              <CardDescription>Administra las campañas solidarias</CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingId(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Campaña
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Campaña" : "Nueva Campaña"}</DialogTitle>
                  <DialogDescription>
                    {editingId ? "Actualiza los detalles de la campaña" : "Crea una nueva campaña solidaria"}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título de la campaña" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descripción de la campaña" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta de recaudación ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha inicio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha fin</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {editingId ? "Actualizar" : "Crear"} Campaña
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay campañas aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{campaign.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(campaign.id)}
                            disabled={deleting === campaign.id}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleting === campaign.id ? "Eliminando..." : "Eliminar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Recaudación</span>
                        <span className="font-medium">${campaign.current_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(campaign)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{getProgressPercentage(campaign).toFixed(0)}% completado</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      <span className="text-gray-500 text-xs">
                        {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
