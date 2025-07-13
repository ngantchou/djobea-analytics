import { ApiClient } from "@/lib/api-client"

export interface Transaction {
  id: string
  type: "income" | "expense" | "refund" | "commission"
  amount: number
  currency: string
  description: string
  category: string
  subcategory?: string
  requestId?: string
  providerId?: string
  clientId?: string
  status: "pending" | "completed" | "failed" | "cancelled"
  paymentMethod?: string
  reference?: string
  metadata?: Record<string, any>
  processedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  completedTransactions: number
  averageTransactionValue: number
  monthlyGrowth: number
  commissionRate: number
}

export interface CashFlowData {
  period: string
  income: number
  expenses: number
  netFlow: number
  cumulativeFlow: number
}

export interface RevenueBreakdown {
  category: string
  amount: number
  percentage: number
  transactions: number
  growth: number
}

export interface FinancialForecast {
  period: string
  predictedRevenue: number
  predictedExpenses: number
  confidence: number
  factors: string[]
}

export interface FinanceFilters {
  dateRange?: {
    start: string
    end: string
  }
  type?: string[]
  category?: string[]
  status?: string[]
  amountRange?: {
    min: number
    max: number
  }
  providerId?: string
  clientId?: string
}

export class FinancesService {
  static async getTransactions(
    filters?: FinanceFilters,
    page = 1,
    limit = 50,
  ): Promise<{
    transactions: Transaction[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const response = await ApiClient.post<{
        transactions: Transaction[]
        total: number
        page: number
        totalPages: number
      }>("/api/finances/transactions", {
        filters,
        page,
        limit,
      })
      return response
    } catch (error) {
      console.error("Get transactions error:", error)
      throw new Error("Erreur lors de la récupération des transactions")
    }
  }

  static async getFinancialStats(filters?: FinanceFilters): Promise<FinancialStats> {
    try {
      const response = await ApiClient.post<FinancialStats>("/api/finances/stats", { filters })
      return response
    } catch (error) {
      console.error("Get financial stats error:", error)
      throw new Error("Erreur lors de la récupération des statistiques financières")
    }
  }

  static async getCashFlowData(
    period: "daily" | "weekly" | "monthly" | "yearly",
    filters?: FinanceFilters,
  ): Promise<CashFlowData[]> {
    try {
      const response = await ApiClient.post<CashFlowData[]>("/api/finances/cash-flow", {
        period,
        filters,
      })
      return response
    } catch (error) {
      console.error("Get cash flow data error:", error)
      throw new Error("Erreur lors de la récupération des données de trésorerie")
    }
  }

  static async getRevenueBreakdown(filters?: FinanceFilters): Promise<RevenueBreakdown[]> {
    try {
      const response = await ApiClient.post<RevenueBreakdown[]>("/api/finances/revenue-breakdown", { filters })
      return response
    } catch (error) {
      console.error("Get revenue breakdown error:", error)
      throw new Error("Erreur lors de la récupération de la répartition des revenus")
    }
  }

  static async getFinancialForecast(months: number, filters?: FinanceFilters): Promise<FinancialForecast[]> {
    try {
      const response = await ApiClient.post<FinancialForecast[]>("/api/finances/forecast", {
        months,
        filters,
      })
      return response
    } catch (error) {
      console.error("Get financial forecast error:", error)
      throw new Error("Erreur lors de la récupération des prévisions financières")
    }
  }

  static async createTransaction(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    try {
      const response = await ApiClient.post<Transaction>("/api/finances/transactions/create", data)
      return response
    } catch (error) {
      console.error("Create transaction error:", error)
      throw new Error("Erreur lors de la création de la transaction")
    }
  }

  static async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await ApiClient.put<Transaction>(`/api/finances/transactions/${id}`, data)
      return response
    } catch (error) {
      console.error("Update transaction error:", error)
      throw new Error("Erreur lors de la mise à jour de la transaction")
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/finances/transactions/${id}`)
    } catch (error) {
      console.error("Delete transaction error:", error)
      throw new Error("Erreur lors de la suppression de la transaction")
    }
  }

  static async processPayment(requestId: string, amount: number, paymentMethod: string): Promise<Transaction> {
    try {
      const response = await ApiClient.post<Transaction>("/api/finances/process-payment", {
        requestId,
        amount,
        paymentMethod,
      })
      return response
    } catch (error) {
      console.error("Process payment error:", error)
      throw new Error("Erreur lors du traitement du paiement")
    }
  }

  static async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    try {
      const response = await ApiClient.post<Transaction>(`/api/finances/transactions/${transactionId}/refund`, {
        amount,
        reason,
      })
      return response
    } catch (error) {
      console.error("Refund payment error:", error)
      throw new Error("Erreur lors du remboursement")
    }
  }

  static async generateInvoice(transactionId: string): Promise<Blob> {
    try {
      const response = await ApiClient.get(`/api/finances/transactions/${transactionId}/invoice`, {
        responseType: "blob",
      })
      return response
    } catch (error) {
      console.error("Generate invoice error:", error)
      throw new Error("Erreur lors de la génération de la facture")
    }
  }

  static async exportFinancialData(filters?: FinanceFilters, format: "csv" | "xlsx" | "pdf" = "csv"): Promise<Blob> {
    try {
      const response = await ApiClient.post(
        "/api/finances/export",
        {
          filters,
          format,
        },
        {
          responseType: "blob",
        },
      )
      return response
    } catch (error) {
      console.error("Export financial data error:", error)
      throw new Error("Erreur lors de l'export des données financières")
    }
  }

  static async shareFinancialReport(reportId: string, emails: string[]): Promise<void> {
    try {
      await ApiClient.post("/api/finances/share", {
        reportId,
        emails,
      })
    } catch (error) {
      console.error("Share financial report error:", error)
      throw new Error("Erreur lors du partage du rapport financier")
    }
  }

  static async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await ApiClient.get<any[]>("/api/finances/payment-methods")
      return response
    } catch (error) {
      console.error("Get payment methods error:", error)
      throw new Error("Erreur lors de la récupération des méthodes de paiement")
    }
  }

  static async updatePaymentMethod(id: string, data: any): Promise<any> {
    try {
      const response = await ApiClient.put<any>(`/api/finances/payment-methods/${id}`, data)
      return response
    } catch (error) {
      console.error("Update payment method error:", error)
      throw new Error("Erreur lors de la mise à jour de la méthode de paiement")
    }
  }

  static async getTaxReport(year: number): Promise<any> {
    try {
      const response = await ApiClient.get<any>(`/api/finances/tax-report/${year}`)
      return response
    } catch (error) {
      console.error("Get tax report error:", error)
      throw new Error("Erreur lors de la récupération du rapport fiscal")
    }
  }

  static async reconcileTransactions(bankStatementId: string): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/finances/reconcile", {
        bankStatementId,
      })
      return response
    } catch (error) {
      console.error("Reconcile transactions error:", error)
      throw new Error("Erreur lors de la réconciliation des transactions")
    }
  }
}
