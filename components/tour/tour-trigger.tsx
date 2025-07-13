"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function TourTrigger() {
  const [showTour, setShowTour] = useState(false)

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2 }}
    >
      <Button
        onClick={() => setShowTour(true)}
        variant="outline"
        className="bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Aide
      </Button>
    </motion.div>
  )
}
