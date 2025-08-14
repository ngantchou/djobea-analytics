"use client"

import { useState } from "react"
import { Download, RefreshCw, FileText, Plus, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface FinancesQuickActionsProps {
  onRefresh?: () => void
}

export function FinancesQuickActions({ onRefresh }: FinancesQuickActionsProps) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      toast.success("Données actualisées avec succès")
    } catch (error) {
      toast.error("Erreur lors de l'actualisation")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async (format: string, options: any) => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/finances/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, ...options }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finances-export.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success(`Rapport exporté au format ${format.toUpperCase()} avec succès`)
      }
    } catch (error) {
      toast.error("Erreur lors de l'export")
    } finally {
      setIsExporting(false)
    }
    setIsExportOpen(false)
  }

  const handleShare = async (email: string, message: string) => {
    try {
      const response = await fetch("/api/finances/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      })

      if (response.ok) {
        toast.success(`Lien de partage copié dans le presse-papiers`)
      }
    } catch (error) {
      toast.error("Erreur lors du partage")
    }
    setIsShareOpen(false)
  }

  const handleAddTransaction = async (transactionData: any) => {
    try {
      const response = await fetch("/api/finances/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        toast.success("Transaction ajoutée avec succès")
        onRefresh()
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la transaction")
    }
    setIsAddTransactionOpen(false)
  }

  const handleGenerateReport = () => {
    toast.info("Génération de rapport (à implémenter)")
  }

  const handleAnalyzeTrends = () => {
    toast.info("Analyse des tendances (à implémenter)")
  }

  const handleFinancialSettings = () => {
    toast.info("Paramètres financiers (à implémenter)")
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Actions rapides</span>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              5 disponibles
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? "Export..." : "Exporter"}
            </Button>

            <Button
              onClick={handleGenerateReport}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapport
            </Button>

            <Button
              onClick={() => setIsShareOpen(true)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share className="w-4 h-4 mr-2" />
              Partager
            </Button>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
