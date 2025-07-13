"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileText, ImageIcon, Database, Mail, Calendar, Settings, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationStore } from "@/store/use-notification-store"

interface ExportFormat {
  id: string
  name: string
  extension: string
  icon: any
  description: string
  features: string[]
}

interface ExportJob {
  id: string
  format: string
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  fileName: string
  size?: string
  downloadUrl?: string
  createdAt: Date
}

export function ExportManager() {
  const { addNotification } = useNotificationStore()
  const [selectedFormat, setSelectedFormat] = useState<string>("excel")
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(true)
  const [dateRange, setDateRange] = useState("30d")
  const [emailRecipients, setEmailRecipients] = useState("")
  const [autoSchedule, setAutoSchedule] = useState(false)

  const exportFormats: ExportFormat[] = [
    {
      id: "excel",
      name: "Excel",
      extension: ".xlsx",
      icon: FileText,
      description: "Feuilles de calcul avec graphiques et tableaux",
      features: ["Tableaux", "Graphiques", "Formules", "Mise en forme"],
    },
    {
      id: "pdf",
      name: "PDF",
      extension: ".pdf",
      icon: FileText,
      description: "Rapport professionnel prêt à imprimer",
      features: ["Mise en page", "Graphiques", "Tableaux", "Branding"],
    },
    {
      id: "csv",
      name: "CSV",
      extension: ".csv",
      icon: Database,
      description: "Données brutes pour analyse externe",
      features: ["Données brutes", "Compatible Excel", "Léger"],
    },
    {
      id: "json",
      name: "JSON",
      extension: ".json",
      icon: Database,
      description: "Format structuré pour développeurs",
      features: ["API friendly", "Structuré", "Métadonnées"],
    },
    {
      id: "png",
      name: "Images",
      extension: ".png",
      icon: ImageIcon,
      description: "Graphiques et visualisations en haute qualité",
      features: ["Haute résolution", "Transparence", "Web ready"],
    },
  ]

  const handleExport = async () => {
    const newJob: ExportJob = {
      id: `export_${Date.now()}`,
      format: selectedFormat,
      status: "pending",
      progress: 0,
      fileName: `djobea_export_${new Date().toISOString().split("T")[0]}.${exportFormats.find((f) => f.id === selectedFormat)?.extension}`,
      createdAt: new Date(),
    }

    setExportJobs((prev) => [newJob, ...prev])

    addNotification({
      id: Date.now().toString(),
      message: `Export ${selectedFormat.toUpperCase()} démarré`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })

    // Simulation du processus d'export
    simulateExportProcess(newJob.id)
  }

  const simulateExportProcess = async (jobId: string) => {
    const updateJob = (updates: Partial<ExportJob>) => {
      setExportJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job)))
    }

    // Phase de traitement
    updateJob({ status: "processing", progress: 10 })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateJob({ progress: 30 })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateJob({ progress: 60 })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateJob({ progress: 90 })
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Finalisation
    updateJob({
      status: "completed",
      progress: 100,
      size: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)}MB`,
      downloadUrl: "#",
    })

    addNotification({
      id: Date.now().toString(),
      message: `Export terminé avec succès`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleDownload = (job: ExportJob) => {
    // Simulation du téléchargement
    addNotification({
      id: Date.now().toString(),
      message: `Téléchargement de ${job.fileName} démarré`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleEmailExport = () => {
    if (!emailRecipients) {
      addNotification({
        id: Date.now().toString(),
        message: "Veuillez saisir au moins une adresse email",
        type: "warning",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    addNotification({
      id: Date.now().toString(),
      message: `Export envoyé par email à ${emailRecipients}`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const getStatusColor = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getStatusText = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return "Terminé"
      case "processing":
        return "En cours"
      case "error":
        return "Erreur"
      default:
        return "En attente"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestionnaire d'Export</h2>
          <p className="text-gray-400">Exportez vos données dans différents formats</p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="export">Nouvel Export</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration d'export */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Configuration d'Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Période des données</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 derniers jours</SelectItem>
                      <SelectItem value="30d">30 derniers jours</SelectItem>
                      <SelectItem value="90d">3 derniers mois</SelectItem>
                      <SelectItem value="1y">Dernière année</SelectItem>
                      <SelectItem value="all">Toutes les données</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Inclure les graphiques</Label>
                    <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Inclure les données brutes</Label>
                    <Switch checked={includeRawData} onCheckedChange={setIncludeRawData} />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Email (optionnel)</Label>
                  <Input
                    placeholder="email@exemple.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  {emailRecipients && (
                    <Button
                      onClick={handleEmailExport}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Formats disponibles */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Formats Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon
                    return (
                      <div
                        key={format.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{format.name}</span>
                              <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                {format.extension}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{format.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {format.features.map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="border-gray-600 text-gray-400 text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {selectedFormat === format.id && <Check className="w-5 h-5 text-blue-400" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Historique des Exports</CardTitle>
            </CardHeader>
            <CardContent>
              {exportJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun export réalisé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(job.status)} text-white`}>
                            {getStatusText(job.status)}
                          </Badge>
                          <span className="text-white font-medium">{job.fileName}</span>
                        </div>
                        {job.size && <span className="text-sm text-gray-400">{job.size}</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        {job.status === "processing" && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{job.progress}%</span>
                          </div>
                        )}

                        {job.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(job)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        )}

                        <span className="text-xs text-gray-500">{job.createdAt.toLocaleString("fr-FR")}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Exports Automatiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Activer les exports automatiques</Label>
                  <p className="text-sm text-gray-400">Générer des rapports périodiques</p>
                </div>
                <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
              </div>

              {autoSchedule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Fréquence</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Quotidien</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {exportFormats.map((format) => (
                            <SelectItem key={format.id} value={format.id}>
                              {format.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Destinataires email</Label>
                    <Input
                      placeholder="admin@djobea.ai, manager@djobea.ai"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurer la planification
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
