"use client"

import styled from "styled-components"
import { Download, RefreshCw, Settings, Filter, Share, FileText, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore } from "@/store/use-notification-store"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const QuickActions = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ActionFab = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--glow);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const ActionTooltip = styled(motion.div)`
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
`

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState("json")
  const [exportPeriod, setExportPeriod] = useState("7d")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)
  const [includeLeaderboard, setIncludeLeaderboard] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          period: exportPeriod,
          includeCharts,
          includeInsights,
          includeLeaderboard,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${exportPeriod}-${Date.now()}.${exportFormat}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success("Export réussi", {
        description: "Les données analytics ont été exportées avec succès",
      })
      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur d'export", {
        description: "Impossible d'exporter les données",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter les données
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Format d'export</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Période</Label>
            <Select value={exportPeriod} onValueChange={setExportPeriod}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Données à inclure</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="charts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
                <Label htmlFor="charts" className="text-sm">
                  Graphiques et métriques
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="insights" checked={includeInsights} onCheckedChange={setIncludeInsights} />
                <Label htmlFor="insights" className="text-sm">
                  Insights IA
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="leaderboard" checked={includeLeaderboard} onCheckedChange={setIncludeLeaderboard} />
                <Label htmlFor="leaderboard" className="text-sm">
                  Classement prestataires
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {loading ? "Export..." : "Exporter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const [shareType, setShareType] = useState("link")
  const [recipients, setRecipients] = useState("")
  const [message, setMessage] = useState("")
  const [includeFilters, setIncludeFilters] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: shareType,
          recipients: recipients.split(",").map((r) => r.trim()),
          message,
          includeFilters,
        }),
      })

      if (!response.ok) throw new Error("Share failed")

      const data = await response.json()

      if (shareType === "link") {
        await navigator.clipboard.writeText(data.shareUrl)
        toast.success("Lien copié", {
          description: "Le lien de partage a été copié dans le presse-papiers",
        })
      } else {
        toast.success("Rapport envoyé", {
          description: `Rapport envoyé à ${recipients.split(",").length} destinataire(s)`,
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur de partage", {
        description: "Impossible de partager le rapport",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Partager le rapport
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type de partage</Label>
            <Select value={shareType} onValueChange={setShareType}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Lien de partage</SelectItem>
                <SelectItem value="email">Envoyer par email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shareType === "email" && (
            <div className="space-y-2">
              <Label>Destinataires (séparés par des virgules)</Label>
              <Input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="bg-slate-800 border-slate-600"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Message (optionnel)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message personnalisé..."
              className="bg-slate-800 border-slate-600"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="filters" checked={includeFilters} onCheckedChange={setIncludeFilters} />
            <Label htmlFor="filters" className="text-sm">
              Inclure les filtres actuels
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleShare}
              disabled={loading || (shareType === "email" && !recipients)}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600"
            >
              {loading ? "Partage..." : "Partager"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const [reportType, setReportType] = useState("executive")
  const [reportPeriod, setReportPeriod] = useState("7d")
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [includeComparisons, setIncludeComparisons] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          period: reportPeriod,
          includeRecommendations,
          includeComparisons,
        }),
      })

      if (!response.ok) throw new Error("Report generation failed")

      const data = await response.json()

      toast.success("Rapport généré", {
        description: `Rapport ${reportType} généré avec succès. ID: ${data.reportId}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur de génération", {
        description: "Impossible de générer le rapport",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générer un rapport
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type de rapport</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Rapport exécutif</SelectItem>
                <SelectItem value="detailed">Rapport détaillé</SelectItem>
                <SelectItem value="performance">Rapport performance</SelectItem>
                <SelectItem value="financial">Rapport financier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Période d'analyse</Label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Options avancées</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={includeRecommendations}
                  onCheckedChange={setIncludeRecommendations}
                />
                <Label htmlFor="recommendations" className="text-sm">
                  Inclure les recommandations IA
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="comparisons" checked={includeComparisons} onCheckedChange={setIncludeComparisons} />
                <Label htmlFor="comparisons" className="text-sm">
                  Comparaisons avec période précédente
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Aperçu du rapport</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>• KPIs et métriques principales</div>
              <div>• Graphiques de performance</div>
              <div>• Analyse des tendances</div>
              {includeRecommendations && <div>• Recommandations IA</div>}
              {includeComparisons && <div>• Comparaisons temporelles</div>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {loading ? "Génération..." : "Générer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AnalyticsQuickActions() {
  const { addNotification } = useNotificationStore()
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/analytics/refresh", { method: "POST" })
      if (!response.ok) throw new Error("Refresh failed")

      toast.success("Données actualisées", {
        description: "Les analytics ont été mis à jour",
      })
    } catch (error) {
      toast.error("Erreur d'actualisation", {
        description: "Impossible d'actualiser les données",
      })
    }
  }

  const handleSettings = () => {
    window.location.href = "/settings/analytics"
  }

  const handleFilters = () => {
    // Scroll to filters section
    const filtersSection = document.querySelector('[data-section="filters"]')
    if (filtersSection) {
      filtersSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const actions = [
    {
      icon: Download,
      onClick: () => setExportModalOpen(true),
      title: "Exporter les données",
      id: "export",
    },
    {
      icon: RefreshCw,
      onClick: handleRefresh,
      title: "Actualiser",
      id: "refresh",
    },
    {
      icon: Filter,
      onClick: handleFilters,
      title: "Filtres avancés",
      id: "filters",
    },
    {
      icon: Share,
      onClick: () => setShareModalOpen(true),
      title: "Partager",
      id: "share",
    },
    {
      icon: FileText,
      onClick: () => setReportModalOpen(true),
      title: "Générer rapport",
      id: "report",
    },
    {
      icon: Settings,
      onClick: handleSettings,
      title: "Paramètres",
      id: "settings",
    },
  ]

  return (
    <>
      <QuickActions>
        {actions.map((action, index) => (
          <ActionFab
            key={action.id}
            onClick={action.onClick}
            title={action.title}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <action.icon />
            <AnimatePresence>
              {hoveredAction === action.id && (
                <ActionTooltip
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {action.title}
                </ActionTooltip>
              )}
            </AnimatePresence>
          </ActionFab>
        ))}
      </QuickActions>

      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
      <ShareModal open={shareModalOpen} onOpenChange={setShareModalOpen} />
      <ReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} />
    </>
  )
}
