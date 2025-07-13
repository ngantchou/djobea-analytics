"use client"
import { motion } from "framer-motion"
import { Settings, RefreshCw, CheckCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { SystemStatusCard } from "./components/system-status-card"
import { MaintenanceTab } from "./components/maintenance-tab"
import { DeploymentTab } from "./components/deployment-tab"
import { FeatureFlagsTab } from "./components/feature-flags-tab"
import { HistoryTab } from "./components/history-tab"
import { useMaintenanceSettings } from "./hooks/use-maintenance-settings"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function MaintenanceSettingsPage() {
  const {
    loading,
    hasUnsavedChanges,
    maintenanceSettings,
    deploymentSettings,
    systemStatus,
    featureFlags,
    deploymentHistory,
    isMaintenanceMode,
    handleSaveSettings,
    handleResetSettings,
    handleTestSystem,
    setMaintenanceSettings,
    setDeploymentSettings,
    setFeatureFlags,
    setIsMaintenanceMode,
  } = useMaintenanceSettings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      </div>

      {/* Unsaved changes banner */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 text-center text-sm font-medium"
        >
          ⚠️ Vous avez des modifications non sauvegardées
          <Button
            size="sm"
            variant="outline"
            className="ml-4 bg-black/20 border-black/30 text-black hover:bg-black/30"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Sauvegarder maintenant
          </Button>
        </motion.div>
      )}

      {/* Back button */}
      <div className={`fixed ${hasUnsavedChanges ? "top-24" : "top-20"} left-4 z-50`}>
        <Link href="/settings">
          <Button
            variant="outline"
            className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Retour aux paramètres
          </Button>
        </Link>
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 ${hasUnsavedChanges ? "pt-20" : "pt-8"} pb-8`}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/settings" className="hover:text-white transition-colors">
              Paramètres
            </Link>
            <span>/</span>
            <span className="text-white">Maintenance & Déploiement</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Maintenance & Déploiement
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Gestion de la maintenance programmée, déploiements et feature flags
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={handleSaveSettings}
              disabled={loading || !hasUnsavedChanges}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              variant="outline"
              onClick={handleTestSystem}
              disabled={loading}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Tester le système
            </Button>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* System Status */}
          <motion.div variants={itemVariants}>
            <SystemStatusCard systemStatus={systemStatus} />
          </motion.div>

          {/* Main Tabs */}
          <Tabs defaultValue="maintenance" className="space-y-6">
            <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-600">
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="deployment" className="data-[state=active]:bg-purple-600">
                Déploiement
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-purple-600">
                Feature Flags
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="maintenance">
              <MaintenanceTab
                maintenanceSettings={maintenanceSettings}
                setMaintenanceSettings={setMaintenanceSettings}
                isMaintenanceMode={isMaintenanceMode}
                setIsMaintenanceMode={setIsMaintenanceMode}
                systemStatus={systemStatus}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="deployment">
              <DeploymentTab
                deploymentSettings={deploymentSettings}
                setDeploymentSettings={setDeploymentSettings}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="features">
              <FeatureFlagsTab
                featureFlags={featureFlags}
                setFeatureFlags={setFeatureFlags}
                deploymentSettings={deploymentSettings}
              />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab deploymentHistory={deploymentHistory} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
