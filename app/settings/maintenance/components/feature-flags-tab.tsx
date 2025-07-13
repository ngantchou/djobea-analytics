"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import type { FeatureFlag, DeploymentSettings } from "../hooks/use-maintenance-settings"

interface FeatureFlagsTabProps {
  featureFlags: FeatureFlag[]
  setFeatureFlags: (flags: FeatureFlag[]) => void
  deploymentSettings: DeploymentSettings
}

export function FeatureFlagsTab({ featureFlags, setFeatureFlags, deploymentSettings }: FeatureFlagsTabProps) {
  const [showFeatureFlagModal, setShowFeatureFlagModal] = useState(false)
  const [editingFeatureFlag, setEditingFeatureFlag] = useState<FeatureFlag | null>(null)
  const [newFeatureFlag, setNewFeatureFlag] = useState<Partial<FeatureFlag>>({
    name: "",
    description: "",
    enabled: false,
    rolloutPercentage: 0,
    environments: ["development"],
  })

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

  const toggleFeatureFlag = async (flagId: string) => {
    try {
      const response = await fetch(`/api/settings/maintenance/feature-flags/${flagId}/toggle`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle feature flag")
      }

      setFeatureFlags(
        featureFlags.map((flag) =>
          flag.id === flagId ? { ...flag, enabled: !flag.enabled, updatedAt: new Date().toISOString() } : flag,
        ),
      )
      toast.success("Feature flag mis à jour")
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du feature flag")
    }
  }

  const handleCreateFeatureFlag = async () => {
    if (!newFeatureFlag.name || !newFeatureFlag.description) {
      toast.error("Nom et description requis")
      return
    }

    try {
      const response = await fetch("/api/settings/maintenance/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFeatureFlag,
          id: newFeatureFlag.name?.toLowerCase().replace(/\s+/g, "-"),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create feature flag")
      }

      const createdFlag = await response.json()
      setFeatureFlags([...featureFlags, createdFlag])
      setNewFeatureFlag({
        name: "",
        description: "",
        enabled: false,
        rolloutPercentage: 0,
        environments: ["development"],
      })
      setShowFeatureFlagModal(false)
      toast.success("Feature flag créé avec succès")
    } catch (error) {
      toast.error("Erreur lors de la création du feature flag")
    }
  }

  const handleDeleteFeatureFlag = async (flagId: string) => {
    try {
      const response = await fetch(`/api/settings/maintenance/feature-flags/${flagId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete feature flag")
      }

      setFeatureFlags(featureFlags.filter((flag) => flag.id !== flagId))
      toast.success("Feature flag supprimé")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Flag className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Feature Flags</CardTitle>
                <CardDescription>Gestion des fonctionnalités par environnement</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowFeatureFlagModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Flag className="w-4 h-4 mr-2" />
              Nouveau Flag
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch checked={flag.enabled} onCheckedChange={() => toggleFeatureFlag(flag.id)} />
                    <div>
                      <h4 className="text-white font-medium">{flag.name}</h4>
                      <p className="text-sm text-gray-400">{flag.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${flag.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {flag.enabled ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingFeatureFlag(flag)
                        setShowFeatureFlagModal(true)
                      }}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Modifier
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteFeatureFlag(flag.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Rollout:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={flag.rolloutPercentage} className="flex-1" />
                      <span className="text-white">{flag.rolloutPercentage}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Environnements:</span>
                    <div className="flex gap-1 mt-1">
                      {flag.environments.map((env) => (
                        <Badge key={env} className={`${getEnvironmentColor(env)} text-white text-xs`}>
                          {env}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Mis à jour:</span>
                    <div className="text-white mt-1">{new Date(flag.updatedAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>

                {flag.conditions && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-gray-400 text-sm">Conditions:</span>
                    <div className="flex gap-2 mt-1">
                      {flag.conditions.userSegment && (
                        <Badge variant="outline" className="text-xs">
                          Segment: {flag.conditions.userSegment}
                        </Badge>
                      )}
                      {flag.conditions.region && (
                        <Badge variant="outline" className="text-xs">
                          Région: {flag.conditions.region}
                        </Badge>
                      )}
                      {flag.conditions.version && (
                        <Badge variant="outline" className="text-xs">
                          Version: {flag.conditions.version}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Flag Modal */}
      <Dialog open={showFeatureFlagModal} onOpenChange={setShowFeatureFlagModal}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-green-400" />
              {editingFeatureFlag ? "Modifier" : "Créer"} un Feature Flag
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {editingFeatureFlag
                ? "Modifiez les paramètres du feature flag"
                : "Créez un nouveau feature flag pour contrôler les fonctionnalités"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nom</Label>
                <Input
                  value={editingFeatureFlag?.name || newFeatureFlag.name || ""}
                  onChange={(e) => {
                    if (editingFeatureFlag) {
                      setEditingFeatureFlag({ ...editingFeatureFlag, name: e.target.value })
                    } else {
                      setNewFeatureFlag({ ...newFeatureFlag, name: e.target.value })
                    }
                  }}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Nom du feature flag"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Rollout (%)</Label>
                <Input
                  type="number"
                  value={editingFeatureFlag?.rolloutPercentage || newFeatureFlag.rolloutPercentage || 0}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (editingFeatureFlag) {
                      setEditingFeatureFlag({ ...editingFeatureFlag, rolloutPercentage: value })
                    } else {
                      setNewFeatureFlag({ ...newFeatureFlag, rolloutPercentage: value })
                    }
                  }}
                  className="bg-white/5 border-white/10 text-white"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={editingFeatureFlag?.description || newFeatureFlag.description || ""}
                onChange={(e) => {
                  if (editingFeatureFlag) {
                    setEditingFeatureFlag({ ...editingFeatureFlag, description: e.target.value })
                  } else {
                    setNewFeatureFlag({ ...newFeatureFlag, description: e.target.value })
                  }
                }}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
                placeholder="Description du feature flag"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Environnements</Label>
              <div className="flex gap-2">
                {deploymentSettings.environments.map((env) => (
                  <Button
                    key={env}
                    size="sm"
                    variant={
                      (editingFeatureFlag?.environments || newFeatureFlag.environments || []).includes(env)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      const currentEnvs = editingFeatureFlag?.environments || newFeatureFlag.environments || []
                      const newEnvs = currentEnvs.includes(env)
                        ? currentEnvs.filter((e) => e !== env)
                        : [...currentEnvs, env]

                      if (editingFeatureFlag) {
                        setEditingFeatureFlag({ ...editingFeatureFlag, environments: newEnvs })
                      } else {
                        setNewFeatureFlag({ ...newFeatureFlag, environments: newEnvs })
                      }
                    }}
                    className="capitalize"
                  >
                    {env}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Activé</Label>
                <p className="text-xs text-gray-400">Feature flag actif</p>
              </div>
              <Switch
                checked={editingFeatureFlag?.enabled || newFeatureFlag.enabled || false}
                onCheckedChange={(value) => {
                  if (editingFeatureFlag) {
                    setEditingFeatureFlag({ ...editingFeatureFlag, enabled: value })
                  } else {
                    setNewFeatureFlag({ ...newFeatureFlag, enabled: value })
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFeatureFlagModal(false)
                setEditingFeatureFlag(null)
                setNewFeatureFlag({
                  name: "",
                  description: "",
                  enabled: false,
                  rolloutPercentage: 0,
                  environments: ["development"],
                })
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              onClick={
                editingFeatureFlag
                  ? () => {
                      // Update existing feature flag
                      setFeatureFlags(
                        featureFlags.map((flag) =>
                          flag.id === editingFeatureFlag.id
                            ? { ...editingFeatureFlag, updatedAt: new Date().toISOString() }
                            : flag,
                        ),
                      )
                      setShowFeatureFlagModal(false)
                      setEditingFeatureFlag(null)
                      toast.success("Feature flag mis à jour")
                    }
                  : handleCreateFeatureFlag
              }
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Flag className="w-4 h-4 mr-2" />
              {editingFeatureFlag ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
