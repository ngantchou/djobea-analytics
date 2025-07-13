"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, ArrowLeft } from "lucide-react"
import { useSettingsStore } from "@/store/use-settings-store"
import { SettingsNotification } from "./settings-notification"
import { useSettingsNotification } from "@/hooks/use-settings-notification"

interface SettingsLayoutProps {
  children: ReactNode
  title: string
  description: string
  icon: ReactNode
}

export function SettingsLayout({ children, title, description, icon }: SettingsLayoutProps) {
  const pathname = usePathname()
  const { hasChanges, isLoading, saveSettings } = useSettingsStore()
  const { notification, showNotification, hideNotification } = useSettingsNotification()

  const handleSave = async () => {
    try {
      await saveSettings()
      showNotification("success", "Paramètres sauvegardés avec succès")
    } catch (error) {
      showNotification("error", "Erreur lors de la sauvegarde")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      </div>

      {/* Back button */}
      <div className="fixed top-20 left-4 z-50">
        <Link href="/settings">
          <Button
            variant="outline"
            className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux paramètres
          </Button>
        </Link>
      </div>

      {/* Notification */}
      <SettingsNotification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
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
            <span className="text-white">{title}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
            {icon}
            {title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{description}</p>
        </motion.div>

        {/* Content */}
        {children}

        {/* Global Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
              size="lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
