"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Play, FileText, X, Sparkles, Code, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function SettingsFloatingActions() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const actions = [
    {
      icon: Sparkles,
      label: "Fonctionnalités",
      description: "Découvrir toutes les fonctionnalités",
      color: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      href: "/features",
      badge: "Nouveau",
    },
    {
      icon: Route,
      label: "Roadmap",
      description: "Feuille de route et statut d'implémentation",
      color: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
      href: "/roadmap",
    },
    {
      icon: Play,
      label: "Visite Guidée",
      description: "Tour interactif de l'application",
      color: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
      href: "/features?tour=true",
      action: () => {
        // Trigger tour
        window.dispatchEvent(new CustomEvent("start-tour"))
        closeMenu()
      },
    },
    {
      icon: Code,
      label: "Documentation API",
      description: "Guide complet des APIs",
      color: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
      href: "/api-docs",
    },
    {
      icon: FileText,
      label: "API Paramètres",
      description: "Documentation des APIs de configuration",
      color: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      href: "/api-docs/settings",
      badge: "Complet",
    },
    {
      icon: BookOpen,
      label: "Guide d'Aide",
      description: "Documentation et support",
      color: "bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700",
      href: "/help",
    },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
              onClick={closeMenu}
            />

            {/* Actions Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <Card className="bg-black/90 backdrop-blur-sm border-white/20 shadow-2xl w-80">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-sm mb-1">Ressources & Documentation</h3>
                    <p className="text-gray-400 text-xs">Accès rapide aux guides et outils</p>
                  </div>

                  <div className="space-y-2">
                    {actions.map((action, index) => {
                      const Icon = action.icon

                      const handleClick = () => {
                        if (action.action) {
                          action.action()
                        } else {
                          closeMenu()
                        }
                      }

                      const ActionButton = (
                        <motion.div
                          key={action.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            onClick={handleClick}
                            className={`w-full justify-start gap-3 ${action.color} text-white relative h-auto p-3 group`}
                            size="sm"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm">{action.label}</div>
                                <div className="text-xs text-white/80">{action.description}</div>
                              </div>
                              {action.badge && (
                                <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 border-white/30">
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        </motion.div>
                      )

                      return action.href ? (
                        <Link key={action.label} href={action.href} onClick={closeMenu}>
                          {ActionButton}
                        </Link>
                      ) : (
                        ActionButton
                      )
                    })}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-purple-400 font-bold text-sm">12</div>
                        <div className="text-gray-400 text-xs">Modules</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-bold text-sm">50+</div>
                        <div className="text-gray-400 text-xs">APIs</div>
                      </div>
                      <div>
                        <div className="text-green-400 font-bold text-sm">95%</div>
                        <div className="text-gray-400 text-xs">Complet</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
        <Button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden ${
            isOpen
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <BookOpen className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Pulse Animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Notification Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            className="w-2 h-2 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Tooltip */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            Documentation & Guides
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/80 rotate-45" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
