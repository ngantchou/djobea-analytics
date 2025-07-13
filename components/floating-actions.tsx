"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, MessageSquare, Phone, Settings, HelpCircle, Map, BarChart3, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  const actions = [
    {
      icon: BarChart3,
      label: "Analytics",
      color: "bg-purple-600 hover:bg-purple-700",
      href: "/analytics",
    },
    {
      icon: Map,
      label: "Vue Carte",
      color: "bg-green-600 hover:bg-green-700",
      href: "/map",
    },
    {
      icon: FileText,
      label: "Nouvelle demande",
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/requests",
    },
    {
      icon: Users,
      label: "Prestataires",
      color: "bg-orange-600 hover:bg-orange-700",
      href: "/providers",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      color: "bg-cyan-600 hover:bg-cyan-700",
      badge: notifications,
      href: "/messages",
    },
    {
      icon: Phone,
      label: "Support",
      color: "bg-red-600 hover:bg-red-700",
      action: () => window.open("tel:+237123456789"),
    },
    {
      icon: Settings,
      label: "Paramètres",
      color: "bg-gray-600 hover:bg-gray-700",
      href: "/settings",
    },
    {
      icon: HelpCircle,
      label: "Aide",
      color: "bg-yellow-600 hover:bg-yellow-700",
      href: "/help",
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="bg-gray-800/95 backdrop-blur-sm border-gray-700 shadow-2xl">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {actions.map((action, index) => {
                    const Icon = action.icon
                    const ActionButton = (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          onClick={() => {
                            if (action.action) {
                              action.action()
                            }
                            setIsOpen(false)
                          }}
                          className={`w-full justify-start gap-3 ${action.color} text-white relative h-12`}
                          size="sm"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{action.label}</span>
                          {action.badge && (
                            <Badge className="ml-auto bg-white text-gray-900 text-xs px-1 py-0">{action.badge}</Badge>
                          )}
                        </Button>
                      </motion.div>
                    )

                    return action.href ? (
                      <Link key={action.label} href={action.href}>
                        {ActionButton}
                      </Link>
                    ) : (
                      ActionButton
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-red-600 hover:bg-red-700 rotate-45"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          }`}
        >
          <Zap className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Notification Badge */}
      {notifications > 0 && !isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs font-bold">{notifications}</span>
        </motion.div>
      )}
    </div>
  )
}
