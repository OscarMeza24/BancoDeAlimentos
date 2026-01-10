import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, EyeOff, Package, Globe } from "lucide-react"

interface ProfilePrivacyDisplayProps {
  isVisible: boolean
  showDonations: boolean
  showLocation: boolean
  allowMessages: boolean
}

export function ProfilePrivacyDisplay({
  isVisible,
  showDonations,
  showLocation,
  allowMessages,
}: ProfilePrivacyDisplayProps) {
  return (
    <Card className="mt-4 border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" />
          Estado de Privacidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="text-sm">Perfil Visible</span>
          </div>
          <Badge variant={isVisible ? "default" : "secondary"}>
            {isVisible ? "Público" : "Privado"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="text-sm">Donaciones Visibles</span>
          </div>
          <Badge variant={showDonations ? "default" : "secondary"}>
            {showDonations ? "Visibles" : "Ocultas"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">Ubicación Visible</span>
          </div>
          <Badge variant={showLocation ? "default" : "secondary"}>
            {showLocation ? "Visible" : "Oculta"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Mensajes Permitidos</span>
          </div>
          <Badge variant={allowMessages ? "default" : "secondary"}>
            {allowMessages ? "Sí" : "No"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
