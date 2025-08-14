"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTransactionActions } from "@/hooks/use-transaction-actions"
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/utils"
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText, 
  User, 
  MapPin, 
  Clock,
  Loader2,
  Edit,
  Trash2
} from "lucide-react"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | null
  onEdit: (transaction: any) => void
  onDelete: (transactionId: string) => void
}

export function TransactionDetailsModal({ 
  isOpen, 
  onClose, 
  transactionId, 
  onEdit, 
  onDelete 
}: TransactionDetailsModalProps) {
  const { getTransactionDetails, isLoading } = useTransactionActions()
  const [transaction, setTransaction] = useState<any>(null)

  useEffect(() => {
    if (isOpen && transactionId) {
      loadTransactionDetails()
    }
  }, [isOpen, transactionId])

  const loadTransactionDetails = async () => {
    if (!transactionId) return
    
    try {
      const details = await getTransactionDetails(transactionId)
      setTransaction(details)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEdit = () => {
    if (transaction) {
      onEdit(transaction)
      onClose()
    }
  }

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Détails de la Transaction
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : transaction ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {transaction.description}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Transaction ID: {transaction.id}
                </p>
              </div>
              <Badge className={getStatusBadgeColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>

            <Separator className="bg-gray-700" />

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date</span>
                </div>
                <p className="text-white font-medium">
                  {formatDate(transaction.date)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Montant</span>
                </div>
                <p className={`font-bold text-lg ${
                  transaction.type === "income" ? "text-green-400" : "text-red-400"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Type</span>
                </div>
                <Badge
                  variant={transaction.type === "income" ? "default" : "secondary"}
                  className={transaction.type === "income" ? "bg-green-600" : "bg-red-600"}
                >
                  {transaction.type === "income" ? "Revenu" : "Dépense"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Catégorie</span>
                </div>
                <p className="text-white font-medium">
                  {transaction.category}
                </p>
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <>
                <Separator className="bg-gray-700" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Notes</span>
                  </div>
                  <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">
                    {transaction.notes}
                  </p>
                </div>
              </>
            )}

            {/* Metadata */}
            {transaction.metadata && (
              <>
                <Separator className="bg-gray-700" />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Informations Complémentaires
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {transaction.metadata.client_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Client:</span>
                        <span className="text-white">{transaction.metadata.client_name}</span>
                      </div>
                    )}

                    {transaction.metadata.provider_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Prestataire:</span>
                        <span className="text-white">{transaction.metadata.provider_name}</span>
                      </div>
                    )}

                    {transaction.metadata.service_type && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white">{transaction.metadata.service_type}</span>
                      </div>
                    )}

                    {transaction.metadata.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Durée:</span>
                        <span className="text-white">{transaction.metadata.duration}</span>
                      </div>
                    )}

                    {transaction.metadata.location && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Localisation:</span>
                        <span className="text-white">{transaction.metadata.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator className="bg-gray-700" />
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <span>Créé le:</span>
                <p className="text-gray-300 mt-1">
                  {new Date(transaction.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              {transaction.updated_at && (
                <div>
                  <span>Modifié le:</span>
                  <p className="text-gray-300 mt-1">
                    {new Date(transaction.updated_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <Separator className="bg-gray-700" />
            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Transaction non trouvée
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}