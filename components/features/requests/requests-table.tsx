"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AssignRequestModal } from "@/components/features/requests/modals/assign-request-modal"
import { ContactProviderModal } from "@/components/features/requests/modals/contact-provider-modal"
import { CancelRequestModal } from "@/components/features/requests/modals/cancel-request-modal"
import { ViewRequestModal } from "@/components/features/requests/modals/view-request-modal"
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
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Eye,
  MessageCircle,
  Ban,
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
  scheduledDate?: string | null
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
    limit?: number
    total: number
    totalPages: number
  }
  onUpdateRequest?: (id: string, updates: any) => Promise<void>
  onAssignRequest?: (requestId: string, assignData: any) => Promise<void>
  onCancelRequest?: (requestId: string, reason: string) => Promise<void>
  onPageChange?: (page: number) => void
}

export function RequestsTable({
  requests,
  loading,
  pagination,
  onUpdateRequest,
  onAssignRequest,
  onCancelRequest,
  onPageChange,
}: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigningRequest, setAssigningRequest] = useState<Request | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactingRequest, setContactingRequest] = useState<Request | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancellingRequest, setCancellingRequest] = useState<Request | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingRequest, setViewingRequest] = useState<Request | null>(null)

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
        return <UserCheck className="w-3 h-3" />
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

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (!onUpdateRequest) return
    
    try {
      setActionLoading(requestId)
      await onUpdateRequest(requestId, { status: newStatus })
    } catch (error) {
      console.error("Failed to update request status:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAssign = async (request: Request) => {
    setAssigningRequest(request)
    setAssignModalOpen(true)
  }

  const handleAssignSuccess = () => {
    // Refresh the data or trigger a callback
    if (onUpdateRequest && assigningRequest) {
      onUpdateRequest(assigningRequest.id, { status: "assigned" })
    }
    setAssignModalOpen(false)
    setAssigningRequest(null)
  }

  const handleViewRequest = (request: Request) => {
    setViewingRequest(request)
    setViewModalOpen(true)
  }

  const handleContactProvider = (request: Request) => {
    if (request.assignedProvider) {
      setContactingRequest(request)
      setContactModalOpen(true)
    }
  }

  const handleCancelRequest = (request: Request) => {
    setCancellingRequest(request)
    setCancelModalOpen(true)
  }

  const handleModalSuccess = () => {
    // Refresh the data
    if (onUpdateRequest) {
      // Trigger a general refresh
      window.location.reload()
    }
  }

  const handleCancel = async (requestId: string) => {
    if (!onCancelRequest) return
    
    try {
      setActionLoading(requestId)
      await onCancelRequest(requestId, "Annulé par l'administrateur")
    } catch (error) {
      console.error("Failed to cancel request:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy à HH:mm", { locale: fr })
    } catch {
      return dateString
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
                        {formatDate(request.createdAt)}
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
                        <span>{request.estimatedCost > 0 ? `${request.estimatedCost.toLocaleString()} FCFA` : "À définir"}</span>
                      </div>
                      {request.rating && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-3 h-3" />
                          <span>{request.rating}/5</span>
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Mark In Progress button for pending/assigned requests */}
                        {(request.status === "pending" || request.status === "assigned") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(request.id, "in-progress")
                            }}
                            disabled={actionLoading === request.id}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            En cours
                          </Button>
                        )}

                        {/* Complete button for in-progress requests */}
                        {request.status === "in-progress" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(request.id, "completed")
                            }}
                            disabled={actionLoading === request.id}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Terminer
                          </Button>
                        )}

                        {/* Cancel button for non-completed/cancelled requests */}
                        {!["completed", "cancelled"].includes(request.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelRequest(request)
                            }}
                            disabled={actionLoading === request.id}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Annuler
                          </Button>
                        )}

                        {/* View button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewRequest(request)
                          }}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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
                      <Button variant="ghost" size="sm" disabled={actionLoading === request.id}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir les détails
                      </DropdownMenuItem>
                      
                      {request.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleAssign(request)}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assigner un prestataire
                        </DropdownMenuItem>
                      )}

                      {request.assignedProvider && ["assigned", "in-progress"].includes(request.status) && (
                        <DropdownMenuItem onClick={() => handleContactProvider(request)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter le prestataire
                        </DropdownMenuItem>
                      )}

                      {/* Status change actions are now in quick buttons, keep only specialized actions in dropdown */}
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
                        <p>ID: {request.id}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informations de service</h4>
                      <div className="space-y-1 text-gray-600">
                        <p>Créé: {formatDateTime(request.createdAt)}</p>
                        <p>Mis à jour: {formatDateTime(request.updatedAt)}</p>
                        {request.scheduledDate && (
                          <p>Programmé: {formatDateTime(request.scheduledDate)}</p>
                        )}
                        {request.completedDate && (
                          <p>Terminé: {formatDateTime(request.completedDate)}</p>
                        )}
                        {request.finalCost && <p>Coût final: {request.finalCost.toLocaleString()} FCFA</p>}
                        {request.feedback && <p>Commentaire: {request.feedback}</p>}
                      </div>
                    </div>
                  </div>
                  
                  {request.images && request.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                      <div className="flex gap-2 flex-wrap">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    const current = pagination.page;
                    const total = pagination.totalPages;
                    if (current <= 3) {
                      pageNum = i + 1;
                    } else if (current >= total - 2) {
                      pageNum = total - 4 + i;
                    } else {
                      pageNum = current - 2 + i;
                    }
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* All Modals */}
      {assigningRequest && (
        <AssignRequestModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setAssigningRequest(null)
          }}
          requestId={assigningRequest.id}
          serviceType={assigningRequest.serviceType}
          location={assigningRequest.location}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {contactingRequest && contactingRequest.assignedProvider && (
        <ContactProviderModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false)
            setContactingRequest(null)
          }}
          requestId={contactingRequest.id}
          provider={{
            id: contactingRequest.assignedProvider.id,
            name: contactingRequest.assignedProvider.name,
            phone: contactingRequest.assignedProvider.phone || "",
            email: contactingRequest.assignedProvider.email || "",
            rating: contactingRequest.assignedProvider.rating,
          }}
        />
      )}

      {cancellingRequest && (
        <CancelRequestModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false)
            setCancellingRequest(null)
          }}
          requestId={cancellingRequest.id}
          onCancelSuccess={handleModalSuccess}
        />
      )}

      {viewingRequest && (
        <ViewRequestModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setViewingRequest(null)
          }}
          request={viewingRequest}
          onUpdate={handleModalSuccess}
        />
      )}
    </Card>
  )
}