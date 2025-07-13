"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface KeyboardNavigationContextType {
  isCommandPaletteOpen: boolean
  toggleCommandPalette: () => void
  shortcuts: Record<string, () => void>
  registerShortcut: (key: string, callback: () => void) => void
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined)

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext)
  if (context === undefined) {
    throw new Error("useKeyboardNavigation must be used within a KeyboardNavigationProvider")
  }
  return context
}

export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [shortcuts, setShortcuts] = useState<Record<string, () => void>>({})

  const toggleCommandPalette = () => {
    setIsCommandPaletteOpen((prev) => !prev)
  }

  const registerShortcut = (key: string, callback: () => void) => {
    setShortcuts((prev) => ({ ...prev, [key]: callback }))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        toggleCommandPalette()
        return
      }

      // Handle registered shortcuts
      const shortcutKey = `${event.metaKey || event.ctrlKey ? "cmd+" : ""}${event.shiftKey ? "shift+" : ""}${event.key.toLowerCase()}`
      const shortcut = shortcuts[shortcutKey]
      if (shortcut) {
        event.preventDefault()
        shortcut()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])

  const value: KeyboardNavigationContextType = {
    isCommandPaletteOpen,
    toggleCommandPalette,
    shortcuts,
    registerShortcut,
  }

  return <KeyboardNavigationContext.Provider value={value}>{children}</KeyboardNavigationContext.Provider>
}
