"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTransactionActions } from "@/hooks/use-transaction-actions"
import { Loader2 } from "lucide-react"

interface Transaction {
  id?: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  status: string
  notes?: string
}

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: Transaction | null
  mode: "create" | "edit"
}

const categories = [
  "Services",
  "Commissions",
  "Frais opérationnels",
  "Marketing",
  "Salaires",
  "Loyer",
  "Équipements",
  "Transport",
  "Autres revenus",
  "Autres dépenses"
]

const statuses = [
  { value: "completed", label: "Complété" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annulé" },
  { value: "draft", label: "Brouillon" }
]

export function TransactionFormModal({ isOpen, onClose, onSuccess, transaction, mode }: TransactionFormModalProps) {
  const { createTransaction, updateTransaction, isLoading } = useTransactionActions()
  
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: 0,
    type: "income",
    category: "Services",
    status: "completed",
    notes: ""
  })

  useEffect(() => {
    if (transaction && mode === "edit") {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        status: transaction.status,
        notes: transaction.notes || ""
      })
    } else {
      // Reset form for create mode
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: 0,
        type: "income",
        category: "Services",
        status: "completed",
        notes: ""
      })
    }
  }, [transaction, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === "create") {
        await createTransaction(formData)
      } else if (mode === "edit" && transaction?.id) {
        await updateTransaction(transaction.id, formData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "create" ? "Nouvelle Transaction" : "Modifier Transaction"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === "create" 
              ? "Ajoutez une nouvelle transaction à votre système financier"
              : "Modifiez les détails de cette transaction"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-300">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description
            </Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Ex: Service de plomberie - Réparation fuite"
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          {/* Amount and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
                Montant (XAF)
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                placeholder="25000"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-300">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="income" className="text-white hover:bg-gray-700">
                    Revenu
                  </SelectItem>
                  <SelectItem value="expense" className="text-white hover:bg-gray-700">
                    Dépense
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-300">
              Catégorie
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-300">
              Statut
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white hover:bg-gray-700">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-300">
              Notes (Optionnel)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Informations supplémentaires..."
              className="bg-gray-800 border-gray-600 text-white min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Création..." : "Mise à jour..."}
                </>
              ) : (
                mode === "create" ? "Créer" : "Mettre à jour"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}