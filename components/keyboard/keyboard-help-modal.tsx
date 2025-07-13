"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Search, Keyboard, Command, Navigation, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useKeyboardStore } from "@/store/use-keyboard-store"

interface KeyboardHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardHelpModal({ isOpen, onClose }: KeyboardHelpModalProps) {
  const { shortcuts } = useKeyboardStore()
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", label: "Tous", icon: Keyboard },
    { id: "Navigation", label: "Navigation", icon: Navigation },
    { id: "Application", label: "Application", icon: Command },
    { id: "Actions Rapides", label: "Actions", icon: Zap },
    { id: "Données", label: "Données", icon: Search },
  ]

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    if (!searchQuery) return true
    return (
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getShortcutsByCategory = (category: string) => {
    if (category === "all") return filteredShortcuts
    return filteredShortcuts.filter((shortcut) => shortcut.category === category)
  }

  const formatShortcut = (shortcut: any) => {
    const keys = []
    if (shortcut.ctrlKey) keys.push("Ctrl")
    if (shortcut.altKey) keys.push("Alt")
    if (shortcut.shiftKey) keys.push("Shift")
    keys.push(shortcut.key.toUpperCase())
    return keys
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Keyboard className="w-6 h-6 text-blue-400" />
              Raccourcis Clavier
            </DialogTitle>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un raccourci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-5 bg-gray-800 mb-4">
            {categories.map((category) => {
              const Icon = category.icon
              const count = getShortcutsByCategory(category.id).length
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <Badge variant="secondary" className="ml-1 bg-gray-700 text-gray-300">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="overflow-y-auto max-h-96">
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="space-y-2">
                  {getShortcutsByCategory(category.id).map((shortcut, index) => (
                    <motion.div
                      key={`${shortcut.category}-${shortcut.key}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{shortcut.description}</div>
                        <div className="text-sm text-gray-400">{shortcut.category}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        {formatShortcut(shortcut).map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="outline"
                            className="bg-gray-700 border-gray-600 text-gray-300 font-mono text-xs px-2 py-1"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {getShortcutsByCategory(category.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun raccourci trouvé</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
          <p>
            💡 Astuce : Utilisez <Badge className="mx-1 bg-gray-700 text-gray-300">Échap</Badge> pour fermer cette
            fenêtre
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
