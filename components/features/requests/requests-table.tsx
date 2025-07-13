"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Request {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string
  serviceType: string
  description: string
  location: string
  address: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  completedDate?: string
  assignedProvider?: {
    id: string
    name: string
    rating: number
  }
  estimatedCost: number
  finalCost?: number
  rating?: number
  feedback?: string
  urgency: boolean
  images?: string[]
  notes?: string
}

interface RequestsTableProps {
  requests: Request[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onUpdateRequest?: (id: string, updates: Partial<Request>) => void
  onAssignRequest?: (requestId: string, providerId: string, providerName: string) => void
  onCancelRequest?: (requestId: string, reason: string) => void
}

export function RequestsTable({
  requests,
  loading,
  pagination,
  onUpdateRequest,
  onAssignRequest,
  onCancelRequest,
}: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "assigned":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />
      case "assigned":
        return <User className="w-3 h-3" />
      case "in-progress":
        return <AlertTriangle className="w-3 h-3" />
      case "completed":
        return <CheckCircle className="w-3 h-3" />
      case "cancelled":
        return <XCircle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "assigned":
        return "Assignée"
      case "in-progress":
        return "En cours"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent"
      case "high":
        return "Élevée"
      case "normal":
        return "Normale"
      case "low":
        return "Faible"
      default:
        return priority
    }
  }

  const handleStatusChange = (requestId: string, newStatus: string) => {
    if (onUpdateRequest) {
      onUpdateRequest(requestId, { status: newStatus as any })
    }
  }

  const handleAssign = (requestId: string) => {
    // In a real app, this would open a modal to select a provider
    if (onAssignRequest) {
      onAssignRequest(requestId, "PROV-001", "Jean-Baptiste Électricité")
    }
  }

  const handleCancel = (requestId: string) => {
    // In a real app, this would open a modal to enter cancellation reason
    if (onCancelRequest) {
      onCancelRequest(requestId, "Annulé par l'administrateur")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes de service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes de service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">Aucune demande ne correspond aux critères de recherche.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Demandes de service</span>
          {pagination && (
            <span className="text-sm font-normal text-gray-500">
              {pagination.total} demande{pagination.total > 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                selectedRequest === request.id ? "ring-2 ring-blue-500 border-blue-200" : ""
              }`}
              onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {request.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{request.clientName}</h3>
                      <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                        {getPriorityLabel(request.priority)}
                      </Badge>
                      {request.urgency && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {request.clientPhone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {request.clientEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(request.createdAt), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">{request.serviceType}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                    </div>

                    {request.assignedProvider && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-3 h-3" />
                        <span>Assigné à: {request.assignedProvider.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{request.assignedProvider.rating}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-3 h-3" />
                        <span>{request.estimatedCost.toLocaleString()} FCFA</span>
                      </div>
                      {request.rating && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-3 h-3" />
                          <span>{request.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                    {getStatusIcon(request.status)}
                    {getStatusLabel(request.status)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {request.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handleAssign(request.id)}>
                            Assigner un prestataire
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, "in-progress")}>
                            Marquer en cours
                          </DropdownMenuItem>
                        </>
                      )}
                      {request.status === "assigned" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(request.id, "in-progress")}>
                          Marquer en cours
                        </DropdownMenuItem>
                      )}
                      {request.status === "in-progress" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(request.id, "completed")}>
                          Marquer terminée
                        </DropdownMenuItem>
                      )}
                      {!["completed", "cancelled"].includes(request.status) && (
                        <DropdownMenuItem
                          onClick={() => handleCancel(request.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Annuler la demande
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {selectedRequest === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Détails du client</h4>
                      <div className="space-y-1 text-gray-600">
                        <p>Adresse: {request.address}</p>
                        {request.notes && <p>Notes: {request.notes}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informations de service</h4>
                      <div className="space-y-1 text-gray-600">
                        {request.scheduledDate && (
                          <p>
                            Programmé: {format(new Date(request.scheduledDate), "dd MMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        )}
                        {request.completedDate && (
                          <p>
                            Terminé: {format(new Date(request.completedDate), "dd MMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        )}
                        {request.finalCost && <p>Coût final: {request.finalCost.toLocaleString()} FCFA</p>}
                        {request.feedback && <p>Commentaire: {request.feedback}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
