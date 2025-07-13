"use client"

import { useState } from "react"
import { GitBranch, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import type { DeploymentSettings } from "../hooks/use-maintenance-settings"

interface DeploymentTabProps {
  deploymentSettings: DeploymentSettings
  setDeploymentSettings: (settings: DeploymentSettings) => void
  loading: boolean
}

export function DeploymentTab({ deploymentSettings, setDeploymentSettings, loading }: DeploymentTabProps) {
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState("")
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case "production":
        return "bg-red-500"
      case "staging":
        return "bg-yellow-500"
      case "development":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDeployment = (environment: string) => {
    setSelectedEnvironment(environment)
    setShowDeploymentModal(true)
    setDeploymentProgress(0)
    setDeploymentLogs([])
  }

  const confirmDeployment = async () => {
    setDeploymentLogs([`[${new Date().toLocaleTimeString()}] Démarrage du déploiement vers ${selectedEnvironment}...`])

    try {
      const steps = [
        "Validation des prérequis",
        "Sauvegarde de l'environnement actuel",
        "Déploiement des nouvelles ressources",
        "Tests de santé automatiques",
        "Basculement du trafic",
        "Vérification finale",
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setDeploymentProgress((i + 1) * (100 / steps.length))
        setDeploymentLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}...`])
      }

      const response = await fetch("/api/settings/maintenance/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: selectedEnvironment,
          strategy: deploymentSettings.deploymentStrategy,
        }),
      })

      if (!response.ok) {
        throw new Error("Deployment failed")
      }

      setDeploymentLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Déploiement réussi !`])
      toast.success(`Déploiement vers ${selectedEnvironment} réussi`)
    } catch (error) {
      setDeploymentLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Erreur de déploiement`])
      toast.error("Erreur lors du déploiement")
    }
  }

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <GitBranch className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">Configuration de Déploiement</CardTitle>
              <CardDescription>Gestion des environnements et stratégies de déploiement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Stratégie de déploiement</Label>
                <Select
                  value={deploymentSettings.deploymentStrategy}
                  onValueChange={(value: "rolling" | "blue-green" | "canary") =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      deploymentStrategy: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rolling">Rolling Deployment</SelectItem>
                    <SelectItem value="blue-green">Blue-Green</SelectItem>
                    <SelectItem value="canary">Canary Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">URL de vérification santé</Label>
                <Input
                  value={deploymentSettings.healthCheckUrl}
                  onChange={(e) =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      healthCheckUrl: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Temps max de déploiement (minutes)</Label>
                <Input
                  type="number"
                  value={deploymentSettings.maxDeploymentTime}
                  onChange={(e) =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      maxDeploymentTime: Number.parseInt(e.target.value),
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  min={5}
                  max={120}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Pourcentage de rollout (%)</Label>
                <div className="px-3">
                  <Slider
                    value={[deploymentSettings.rolloutPercentage]}
                    onValueChange={(value) =>
                      setDeploymentSettings({
                        ...deploymentSettings,
                        rolloutPercentage: value[0],
                      })
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-white font-medium">{deploymentSettings.rolloutPercentage}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Blue-Green Deployment</Label>
                  <p className="text-xs text-gray-400">Déploiement sans interruption</p>
                </div>
                <Switch
                  checked={deploymentSettings.blueGreenEnabled}
                  onCheckedChange={(value) =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      blueGreenEnabled: value,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Tests automatisés</Label>
                  <p className="text-xs text-gray-400">Exécuter les tests avant déploiement</p>
                </div>
                <Switch
                  checked={deploymentSettings.automatedTesting}
                  onCheckedChange={(value) =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      automatedTesting: value,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Feature Flags</Label>
                  <p className="text-xs text-gray-400">Activer le système de feature flags</p>
                </div>
                <Switch
                  checked={deploymentSettings.featureFlagsEnabled}
                  onCheckedChange={(value) =>
                    setDeploymentSettings({
                      ...deploymentSettings,
                      featureFlagsEnabled: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Environnements disponibles</Label>
                <div className="space-y-2">
                  {deploymentSettings.environments.map((env) => (
                    <div
                      key={env}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(env)}`} />
                        <span className="text-white capitalize">{env}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeployment(env)}
                          disabled={loading}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Déployer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Modal */}
      <Dialog open={showDeploymentModal} onOpenChange={setShowDeploymentModal}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Déploiement vers {selectedEnvironment}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Déploiement en cours avec la stratégie {deploymentSettings.deploymentStrategy}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progression</span>
                <span className="text-white">{Math.round(deploymentProgress)}%</span>
              </div>
              <Progress value={deploymentProgress} className="w-full" />
            </div>

            <div className="bg-black/50 border border-white/10 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="text-sm font-mono space-y-1">
                {deploymentLogs.map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeploymentModal(false)}
              className="border-white/20 text-white hover:bg-white/10"
              disabled={loading}
            >
              Fermer
            </Button>
            {deploymentProgress === 0 && (
              <Button
                onClick={confirmDeployment}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Confirmer le déploiement
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
