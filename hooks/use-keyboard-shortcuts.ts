"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useKeyboardStore } from "@/store/use-keyboard-store"

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { setCommandPaletteOpen, setSearchOpen, setHelpModalOpen, commandPaletteOpen, searchOpen, helpModalOpen } =
    useKeyboardStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      // Command/Ctrl + K - Global Search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setSearchOpen(true)
        return
      }

      // Command/Ctrl + Shift + P - Command Palette
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "P") {
        event.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      // ? - Help Modal
      if (event.key === "?" && !event.shiftKey) {
        event.preventDefault()
        setHelpModalOpen(true)
        return
      }

      // Escape - Close modals
      if (event.key === "Escape") {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false)
          return
        }
        if (searchOpen) {
          setSearchOpen(false)
          return
        }
        if (helpModalOpen) {
          setHelpModalOpen(false)
          return
        }
      }

      // Navigation shortcuts (only when no modals are open)
      if (!commandPaletteOpen && !searchOpen && !helpModalOpen) {
        switch (event.key) {
          case "1":
            if (event.altKey) {
              event.preventDefault()
              router.push("/")
            }
            break
          case "2":
            if (event.altKey) {
              event.preventDefault()
              router.push("/analytics")
            }
            break
          case "3":
            if (event.altKey) {
              event.preventDefault()
              router.push("/providers")
            }
            break
          case "4":
            if (event.altKey) {
              event.preventDefault()
              router.push("/requests")
            }
            break
          case "5":
            if (event.altKey) {
              event.preventDefault()
              router.push("/settings")
            }
            break
          case "p":
            if (event.altKey) {
              event.preventDefault()
              router.push("/profile")
            }
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router, setCommandPaletteOpen, setSearchOpen, setHelpModalOpen, commandPaletteOpen, searchOpen, helpModalOpen])
}
