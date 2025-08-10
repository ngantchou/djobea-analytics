"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface KeyboardNavigationContextType {
  isCommandPaletteOpen: boolean
  toggleCommandPalette: () => void
  isHelpModalOpen: boolean
  toggleHelpModal: () => void
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const toggleCommandPalette = () => setIsCommandPaletteOpen((prev) => !prev)
  const toggleHelpModal = () => setIsHelpModalOpen((prev) => !prev)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        toggleCommandPalette()
      }

      // Cmd/Ctrl + ? for help
      if ((event.metaKey || event.ctrlKey) && event.key === "?") {
        event.preventDefault()
        toggleHelpModal()
      }

      // Cmd/Ctrl + / for help
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault()
        console.log("Toggle help modal")
      }

      // Escape to close modals
      if (event.key === "Escape") {
        setIsCommandPaletteOpen(false)
        setIsHelpModalOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <KeyboardNavigationContext.Provider
      value={{
        isCommandPaletteOpen,
        toggleCommandPalette,
        isHelpModalOpen,
        toggleHelpModal,
      }}
    >
      {children}
    </KeyboardNavigationContext.Provider>
  )
}
