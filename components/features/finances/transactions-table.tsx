"use client"

import { useState } from "react"
import { useFinancesData } from "@/hooks/use-finances-data"
import { useTransactionActions } from "@/hooks/use-transaction-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransactionFormModal } from "./transaction-form-modal"
import { TransactionDetailsModal } from "./transaction-details-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/utils"
import { Eye, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

export function TransactionsTable() {
  const { data: finances, isLoading, refetch } = useFinancesData()
  const { deleteTransaction } = useTransactionActions()
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Current transaction states
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Action handlers
  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setFormMode("edit")
    setIsFormModalOpen(true)
  }

  const handleDelete = (transactionId: string) => {
    setDeletingTransactionId(transactionId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTransactionId) return
    
    try {
      await deleteTransaction(deletingTransactionId)
      refetch() // Refresh the data
      setIsDeleteDialogOpen(false)
      setDeletingTransactionId(null)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleCreateNew = () => {
    setEditingTransaction(null)
    setFormMode("create")
    setIsFormModalOpen(true)
  }

  const handleFormSuccess = () => {
    refetch() // Refresh the data after create/update
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Transactions récentes</CardTitle>
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Transaction
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Catégorie</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Montant</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Statut</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {finances?.transactions?.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-gray-300">{formatDate(transaction.date)}</td>
                  <td className="py-3 px-4 text-white font-medium">{transaction.description}</td>
                  <td className="py-3 px-4 text-gray-300">{transaction.category}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={transaction.type === "income" ? "default" : "secondary"}
                      className={transaction.type === "income" ? "bg-green-600" : "bg-red-600"}
                    >
                      {transaction.type === "income" ? "Revenu" : "Dépense"}
                    </Badge>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      transaction.type === "income" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => handleViewDetails(transaction.id)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => handleEdit(transaction)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                        onClick={() => handleDelete(transaction.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Modals */}
    <TransactionFormModal
      isOpen={isFormModalOpen}
      onClose={() => setIsFormModalOpen(false)}
      onSuccess={handleFormSuccess}
      transaction={editingTransaction}
      mode={formMode}
    />

    <TransactionDetailsModal
      isOpen={isDetailsModalOpen}
      onClose={() => setIsDetailsModalOpen(false)}
      transactionId={selectedTransactionId}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />

    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={handleConfirmDelete}
      title="Supprimer la transaction"
      description="Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible."
      confirmText="Supprimer"
      cancelText="Annuler"
      variant="danger"
    />
  </>
  )
}
