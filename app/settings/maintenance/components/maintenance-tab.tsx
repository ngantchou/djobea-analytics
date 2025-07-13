"use client"

import { useState } from "react"
import { Calendar, Clock, Play, Pause, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { MaintenanceSettings, SystemStatus } from "../hooks/use-maintenance-settings"

interface MaintenanceTabProps {
  maintenanceSettings: MaintenanceSettings
  setMaintenanceSettings: (settings: MaintenanceSettings) => void
  isMaintenanceMode: boolean
  setIsMaintenanceMode: (mode: boolean) => void
  systemStatus: SystemStatus
  loading: boolean
}

export function MaintenanceTab({
  maintenanceSettings,
  setMaintenanceSettings,
  isMaintenanceMode,
  setIsMaintenanceMode,
  systemStatus,
  loading,
}: MaintenanceTabProps) {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  const getDayName = (dayIndex: number) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    return days[dayIndex]
  }

  const handleToggleMaintenanceMode = () => {
    setShowMaintenanceModal(true)
  }

  const confirmMaintenanceToggle = async () => {
    try {
      const response = await fetch("/api/settings/maintenance/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !isMaintenanceMode }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle maintenance mode")
      }

      setIsMaintenanceMode(!isMaintenanceMode)
      setShowMaintenanceModal(false)
      toast.success(isMaintenanceMode ? "Mode maintenance désactivé" : "Mode maintenance activé")
    } catch (error) {
      toast.error("Erreur lors du changement de mode")
    }
  }

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Maintenance Programmée</CardTitle>
                <CardDescription>Configuration des fenêtres de maintenance</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className={`${isMaintenanceMode ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isMaintenanceMode ? "bg-red-400" : "bg-green-400"}`}
                />
                {isMaintenanceMode ? "Maintenance active" : "Service normal"}
              </Badge>
              <Button
                size="sm"
                variant={isMaintenanceMode ? "destructive" : "default"}
                onClick={handleToggleMaintenanceMode}
                disabled={loading}
              >
                {isMaintenanceMode ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isMaintenanceMode ? "Réactiver" : "Mode maintenance"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Jour de la semaine</Label>
                <Select
                  value={maintenanceSettings.scheduledWindow.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      scheduledWindow: {
                        ...maintenanceSettings.scheduledWindow,
                        dayOfWeek: Number.parseInt(value),
                      },
                    })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {getDayName(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Heure de début</Label>
                  <Input
                    type="time"
                    value={maintenanceSettings.scheduledWindow.startTime}
                    onChange={(e) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        scheduledWindow: {
                          ...maintenanceSettings.scheduledWindow,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Heure de fin</Label>
                  <Input
                    type="time"
                    value={maintenanceSettings.scheduledWindow.endTime}
                    onChange={(e) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        scheduledWindow: {
                          ...maintenanceSettings.scheduledWindow,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Notification préalable (heures)</Label>
                <Input
                  type="number"
                  value={maintenanceSettings.preNotificationHours}
                  onChange={(e) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      preNotificationHours: Number.parseInt(e.target.value),
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  min={1}
                  max={168}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Message de maintenance</Label>
                <Textarea
                  value={maintenanceSettings.maintenanceMessage}
                  onChange={(e) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      maintenanceMessage: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Page de maintenance</Label>
                  <p className="text-xs text-gray-400">Afficher une page statique</p>
                </div>
                <Switch
                  checked={maintenanceSettings.maintenancePageEnabled}
                  onCheckedChange={(value) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      maintenancePageEnabled: value,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Rollback automatique</Label>
                  <p className="text-xs text-gray-400">En cas d'erreur critique</p>
                </div>
                <Switch
                  checked={maintenanceSettings.autoRollbackEnabled}
                  onCheckedChange={(value) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      autoRollbackEnabled: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Timeout rollback (minutes)</Label>
                <Input
                  type="number"
                  value={maintenanceSettings.rollbackTimeoutMinutes}
                  onChange={(e) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      rollbackTimeoutMinutes: Number.parseInt(e.target.value),
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  min={5}
                  max={120}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">IPs autorisées (séparées par des virgules)</Label>
                <Input
                  value={maintenanceSettings.allowedIPs.join(", ")}
                  onChange={(e) =>
                    setMaintenanceSettings({
                      ...maintenanceSettings,
                      allowedIPs: e.target.value
                        .split(",")
                        .map((ip) => ip.trim())
                        .filter(Boolean),
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="192.168.1.1, 10.0.0.1"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Prochaine maintenance</h5>
                <div className="text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{systemStatus.nextMaintenance} WAT</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {getDayName(maintenanceSettings.scheduledWindow.dayOfWeek)} de{" "}
                    {maintenanceSettings.scheduledWindow.startTime} à {maintenanceSettings.scheduledWindow.endTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode Confirmation Modal */}
      <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              {isMaintenanceMode ? "Désactiver" : "Activer"} le mode maintenance
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {isMaintenanceMode
                ? "Êtes-vous sûr de vouloir réactiver le service ? Les utilisateurs pourront à nouveau accéder à l'application."
                : "Êtes-vous sûr de vouloir activer le mode maintenance ? Cela rendra l'application inaccessible aux utilisateurs."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaintenanceModal(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmMaintenanceToggle}
              disabled={loading}
              variant={isMaintenanceMode ? "default" : "destructive"}
            >
              {isMaintenanceMode ? "Réactiver le service" : "Activer la maintenance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
