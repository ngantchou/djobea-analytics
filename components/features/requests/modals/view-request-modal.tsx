"use client"

import { useState } from "react"
import { X, MapPin, Clock, Phone, Mail, User, Star, Calendar, DollarSign, Edit, MessageCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ContactProviderModal } from "@/components/features/requests/modals/contact-provider-modal"
import { CancelRequestModal } from "@/components/features/requests/modals/cancel-request-modal"

// Updated interface to match your API response structure
interface ViewRequest {
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
  estimatedCost: number
  urgency: boolean
  notes?: string
  images?: string[]
  assignedProvider?: {
    id: string
    name: string
    phone: string
    email: string
    rating: number
  }
}

interface ViewRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: ViewRequest | null
  onUpdate?: () => void
}

export function ViewRequestModal({ isOpen, onClose, request, onUpdate }: ViewRequestModalProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  if (!isOpen || !request) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En Attente", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" }
      case "assigned":
        return { label: "Assignée", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" }
      case "in-progress":
        return { label: "En Cours", className: "bg-purple-500/20 text-purple-300 border-purple-500/30" }
      case "completed":
        return { label: "Terminée", className: "bg-green-500/20 text-green-300 border-green-500/30" }
      case "cancelled":
        return { label: "Annulée", className: "bg-red-500/20 text-red-300 border-red-500/30" }
      default:
        return { label: status, className: "bg-slate-500/20 text-slate-300 border-slate-500/30" }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { label: "URGENT", className: "bg-red-500/20 text-red-300 border-red-500/30" }
      case "high":
        return { label: "HAUTE", className: "bg-orange-500/20 text-orange-300 border-orange-500/30" }
      case "normal":
        return { label: "NORMALE", className: "bg-slate-500/20 text-slate-300 border-slate-500/30" }
      case "low":
        return { label: "BASSE", className: "bg-gray-500/20 text-gray-300 border-gray-500/30" }
      default:
        return { label: priority.toUpperCase(), className: "bg-slate-500/20 text-slate-300 border-slate-500/30" }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getClientAvatar = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleContactProvider = () => {
    if (request.assignedProvider) {
      setContactModalOpen(true)
    }
  }

  const handleCancelRequest = () => {
    setCancelModalOpen(true)
  }

  const handleModalSuccess = () => {
    onUpdate?.()
    onClose()
  }

  const statusConfig = getStatusConfig(request.status)
  const priorityConfig = getPriorityConfig(request.priority)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <div className="p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Demande #{request.id}</h2>
                <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                <Badge className={priorityConfig.className}>{priorityConfig.label}</Badge>
                {request.urgency && (
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                    URGENTE
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations client */}
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Informations Client
                </h3>

                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-500/20 text-blue-300 font-semibold text-lg">
                      {getClientAvatar(request.clientName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{request.clientName}</h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a 
                          href={`tel:${request.clientPhone}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {request.clientPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a 
                          href={`mailto:${request.clientEmail}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {request.clientEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{request.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Détails du service */}
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Détails du Service</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Type de service</label>
                    <p className="text-white font-medium">{request.serviceType}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400">Description</label>
                    <p className="text-slate-300 leading-relaxed">{request.description}</p>
                  </div>

                  {request.notes && (
                    <div>
                      <label className="text-sm text-slate-400">Notes</label>
                      <p className="text-slate-300 leading-relaxed">{request.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Localisation */}
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  Localisation
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400">Zone</label>
                    <p className="text-white font-medium">{request.location}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400">Adresse complète</label>
                    <p className="text-slate-300">{request.address}</p>
                  </div>
                </div>
              </Card>

              {/* Coût estimé */}
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  Coût Estimé
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Montant</span>
                    <span className="text-white font-medium">
                      {request.estimatedCost > 0 
                        ? `${request.estimatedCost.toLocaleString()} FCFA`
                        : "À définir"
                      }
                    </span>
                  </div>
                </div>
              </Card>

              {/* Prestataire assigné */}
              {request.assignedProvider && (
                <Card className="p-4 bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Prestataire Assigné
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-500/20 text-purple-300 font-semibold">
                          {request.assignedProvider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{request.assignedProvider.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{request.assignedProvider.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{request.assignedProvider.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleContactProvider}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  </div>
                </Card>
              )}

              {/* Images */}
              {request.images && request.images.length > 0 && (
                <Card className="p-4 bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {request.images.map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Chronologie */}
              <Card className="p-4 bg-slate-800/50 border-slate-700 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Chronologie
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Demande créée</p>
                      <p className="text-sm text-slate-400">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  {request.status !== "pending" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Dernière mise à jour</p>
                        <p className="text-sm text-slate-400">{formatDate(request.updatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {request.scheduledDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Date programmée</p>
                        <p className="text-sm text-slate-400">{formatDate(request.scheduledDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-slate-700">
              <div className="flex gap-3">
                {!["completed", "cancelled"].includes(request.status) && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelRequest}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="border-slate-600 text-slate-300 bg-transparent"
                >
                  Fermer
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Provider Modal */}
      {request.assignedProvider && (
        <ContactProviderModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          requestId={request.id}
          provider={{
            id: request.assignedProvider.id,
            name: request.assignedProvider.name,
            phone: request.assignedProvider.phone,
            email: request.assignedProvider.email,
            rating: request.assignedProvider.rating,
          }}
        />
      )}

      {/* Cancel Request Modal */}
      <CancelRequestModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        requestId={request.id}
        onCancelSuccess={handleModalSuccess}
      />
    </>
  )
}