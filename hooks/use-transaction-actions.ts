"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  status: string
  notes?: string
}

export function useTransactionActions() {
  const [isLoading, setIsLoading] = useState(false)

  const createTransaction = async (transactionData: Omit<Transaction, "id">) => {
    setIsLoading(true)
    try {
      const response = await apiClient.request("/api/finances/transactions", {
        method: "POST",
        body: transactionData,
        requireAuth: false
      })

      if (response.success) {
        toast.success("Transaction créée avec succès")
        return response.data
      } else {
        throw new Error(response.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    setIsLoading(true)
    try {
      const response = await apiClient.request(`/api/finances/transactions/${id}`, {
        method: "PUT",
        body: transactionData,
        requireAuth: false
      })

      if (response.success) {
        toast.success("Transaction mise à jour avec succès")
        return response.data
      } else {
        throw new Error(response.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.request(`/api/finances/transactions/${id}`, {
        method: "DELETE",
        requireAuth: false
      })

      if (response.success) {
        toast.success("Transaction supprimée avec succès")
        return true
      } else {
        throw new Error(response.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionDetails = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.request(`/api/finances/transactions/${id}`, {
        method: "GET",
        requireAuth: false
      })

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || "Erreur lors du chargement")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du chargement")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionDetails,
    isLoading
  }
}