"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Keyboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function KeyboardIndicator() {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isAltPressed, setIsAltPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setIsCtrlPressed(e.ctrlKey || e.metaKey)
      setIsShiftPressed(e.shiftKey)
      setIsAltPressed(e.altKey)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setIsCtrlPressed(e.ctrlKey || e.metaKey)
      setIsShiftPressed(e.shiftKey)
      setIsAltPressed(e.altKey)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const isAnyModifierPressed = isCtrlPressed || isShiftPressed || isAltPressed

  return (
    <AnimatePresence>
      {isAnyModifierPressed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-4 left-4 z-50 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm text-white">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span>Raccourcis actifs:</span>
            <div className="flex items-center gap-1">
              {isCtrlPressed && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                </Badge>
              )}
              {isShiftPressed && <Badge className="bg-purple-600 text-white text-xs">Shift</Badge>}
              {isAltPressed && <Badge className="bg-green-600 text-white text-xs">Alt</Badge>}
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            {isCtrlPressed && (
              <div>• Ctrl+K: Palette de commandes • Ctrl+/: Recherche globale • Ctrl+1-6: Navigation</div>
            )}
            {isShiftPressed && !isCtrlPressed && <div>• Shift+?: Aide raccourcis</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
