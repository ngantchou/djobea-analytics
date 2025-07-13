"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Search,
  Home,
  BarChart3,
  Users,
  FileText,
  Settings,
  Brain,
  DollarSign,
  Plus,
  Download,
  RefreshCw,
  Sparkles,
  Command,
  ArrowRight,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useKeyboardStore } from "@/store/use-keyboard-store"
import { useNotificationStore } from "@/store/use-notification-store"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { addNotification } = useNotificationStore()
  const { commandQuery, setCommandQuery } = useKeyboardStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Aller au Dashboard",
      description: "Vue d'ensemble de l'activité",
      icon: Home,
      action: () => router.push("/"),
      category: "Navigation",
      keywords: ["dashboard", "accueil", "home"],
    },
    {
      id: "nav-analytics",
      title: "Aller aux Analytics",
      description: "Analyses et statistiques détaillées",
      icon: BarChart3,
      action: () => router.push("/analytics"),
      category: "Navigation",
      keywords: ["analytics", "statistiques", "graphiques"],
    },
    {
      id: "nav-ai",
      title: "Aller aux Prédictions IA",
      description: "Intelligence artificielle et prédictions",
      icon: Brain,
      action: () => router.push("/ai"),
      category: "Navigation",
      keywords: ["ia", "ai", "prédictions", "intelligence"],
    },
    {
      id: "nav-providers",
      title: "Aller aux Prestataires",
      description: "Gestion des prestataires de service",
      icon: Users,
      action: () => router.push("/providers"),
      category: "Navigation",
      keywords: ["prestataires", "providers", "équipe"],
    },
    {
      id: "nav-requests",
      title: "Aller aux Demandes",
      description: "Gestion des demandes de service",
      icon: FileText,
      action: () => router.push("/requests"),
      category: "Navigation",
      keywords: ["demandes", "requests", "tickets"],
    },
    {
      id: "nav-finances",
      title: "Aller aux Finances",
      description: "Gestion financière et revenus",
      icon: DollarSign,
      action: () => router.push("/finances"),
      category: "Navigation",
      keywords: ["finances", "argent", "revenus", "facturation"],
    },
    {
      id: "nav-settings",
      title: "Aller aux Paramètres",
      description: "Configuration de l'application",
      icon: Settings,
      action: () => router.push("/settings"),
      category: "Navigation",
      keywords: ["paramètres", "settings", "configuration"],
    },

    // Actions
    {
      id: "action-new-request",
      title: "Nouvelle Demande",
      description: "Créer une nouvelle demande de service",
      icon: Plus,
      action: () => {
        addNotification({
          id: Date.now().toString(),
          message: "Nouvelle demande - Modal ouvert",
          type: "info",
          timestamp: new Date(),
          read: false,
        })
      },
      category: "Actions",
      keywords: ["nouvelle", "demande", "créer", "ajouter"],
    },
    {
      id: "action-new-provider",
      title: "Nouveau Prestataire",
      description: "Ajouter un nouveau prestataire",
      icon: Plus,
      action: () => {
        addNotification({
          id: Date.now().toString(),
          message: "Nouveau prestataire - Modal ouvert",
          type: "info",
          timestamp: new Date(),
          read: false,
        })
      },
      category: "Actions",
      keywords: ["nouveau", "prestataire", "ajouter", "équipe"],
    },
    {
      id: "action-export",
      title: "Exporter les Données",
      description: "Exporter les données au format Excel/PDF",
      icon: Download,
      action: () => {
        addNotification({
          id: Date.now().toString(),
          message: "Export des données en cours...",
          type: "info",
          timestamp: new Date(),
          read: false,
        })
      },
      category: "Actions",
      keywords: ["export", "télécharger", "données", "excel", "pdf"],
    },
    {
      id: "action-refresh",
      title: "Actualiser les Données",
      description: "Recharger toutes les données",
      icon: RefreshCw,
      action: () => {
        window.location.reload()
      },
      category: "Actions",
      keywords: ["actualiser", "refresh", "recharger", "données"],
    },

    // Fonctionnalités
    {
      id: "feature-ai-predictions",
      title: "Prédictions IA",
      description: "Voir les prédictions de l'intelligence artificielle",
      icon: Brain,
      action: () => router.push("/ai"),
      category: "Fonctionnalités",
      keywords: ["ia", "prédictions", "intelligence", "artificielle"],
    },
    {
      id: "feature-advanced-analytics",
      title: "Analytics Avancés",
      description: "Analyses approfondies avec graphiques interactifs",
      icon: BarChart3,
      action: () => router.push("/analytics"),
      category: "Fonctionnalités",
      keywords: ["analytics", "avancés", "graphiques", "analyses"],
    },
    {
      id: "feature-real-time",
      title: "Monitoring Temps Réel",
      description: "Surveillance en temps réel des activités",
      icon: Sparkles,
      action: () => {
        addNotification({
          id: Date.now().toString(),
          message: "Monitoring temps réel activé",
          type: "success",
          timestamp: new Date(),
          read: false,
        })
      },
      category: "Fonctionnalités",
      keywords: ["temps", "réel", "monitoring", "surveillance"],
    },
  ]

  const filteredCommands = commands.filter((command) => {
    if (!commandQuery) return true
    const query = commandQuery.toLowerCase()
    return (
      command.title.toLowerCase().includes(query) ||
      command.description.toLowerCase().includes(query) ||
      command.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    )
  })

  const categories = Array.from(new Set(filteredCommands.map((cmd) => cmd.category)))

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [commandQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case "Enter":
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
        break
      case "Escape":
        onClose()
        break
    }
  }

  const executeCommand = (command: any) => {
    command.action()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-gray-900 border-gray-700 text-white">
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Command className="w-5 h-5 text-blue-400" />
          <Input
            ref={inputRef}
            placeholder="Tapez une commande ou recherchez..."
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent text-white placeholder-gray-400 focus:ring-0"
          />
          <Badge variant="outline" className="border-gray-600 text-gray-400">
            {filteredCommands.length}
          </Badge>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {categories.map((category) => {
            const categoryCommands = filteredCommands.filter((cmd) => cmd.category === category)
            if (categoryCommands.length === 0) return null

            return (
              <div key={category} className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">{category}</div>
                <div className="space-y-1">
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = command.icon

                    return (
                      <motion.div
                        key={command.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-600" : "hover:bg-gray-800"
                        }`}
                        onClick={() => executeCommand(command)}
                      >
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{command.title}</div>
                          <div className="text-sm text-gray-400 truncate">{command.description}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune commande trouvée</p>
              <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 p-3 text-xs text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ pour naviguer</span>
            <span>↵ pour sélectionner</span>
            <span>esc pour fermer</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="bg-gray-700 text-gray-300">Ctrl</Badge>
            <span>+</span>
            <Badge className="bg-gray-700 text-gray-300">K</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
