"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { InteractiveMap } from "@/components/geolocation/interactive-map"
import { MapPin } from "lucide-react"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Carte Interactive</h1>
          </div>
          <p className="text-gray-400">Visualisez en temps réel les prestataires, demandes et zones de service</p>
        </motion.div>

        {/* Map Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Suspense
            fallback={
              <div className="animate-pulse bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p>Chargement de la carte...</p>
                </div>
              </div>
            }
          >
            <InteractiveMap />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
