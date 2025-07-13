"use client"

import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"

export function DashboardTitle() {
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const currentTime = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Tableau de Bord
        </h1>
        <p className="text-gray-400 mt-2">Vue d'ensemble de votre plateforme de services</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{currentDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>
      </motion.div>
    </div>
  )
}
