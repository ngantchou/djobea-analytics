"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

interface FinancesData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  revenueChange: number
  expensesChange: number
  profitChange: number
  marginChange: number
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: "income" | "expense"
    category: string
    status: string
  }>
}

async function fetchFinancesData(): Promise<FinancesData> {
  const response = await fetch("/api/finances")
  if (!response.ok) {
    throw new Error("Failed to fetch finances data")
  }
  return response.json()
}

export function useFinancesData() {
  return useQuery({
    queryKey: ["finances"],
    queryFn: fetchFinancesData,
    refetchInterval: 30000, // Refetch every 30 seconds
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement des données financières"
      toast.error(errorMessage)
    },
  })
}
