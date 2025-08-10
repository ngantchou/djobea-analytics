"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  FileText,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  MessageSquare,
  Map,
  Brain,
  Star,
  Clock,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

interface SearchItem {
  id: string
  title: string
  description: string
  href: string
  icon: any
  category: string
  type: "page" | "action" | "setting"
  keywords: string[]
  isRecent?: boolean
  isStarred?: boolean
}

const searchData: SearchItem[] = [
  // Navigation
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Vue d'ensemble des statistiques",
    href: "/",
    icon: BarChart3,
    category: "Navigation",
    type: "page",
    keywords: ["dashboard", "accueil", "statistiques", "vue d'ensemble"],
    isRecent: true,
  },
  {
    id: "requests",
    title: "Demandes",
    description: "Gérer les demandes de services",
    href: "/requests",
    icon: FileText,
    category: "Navigation",
    type: "page",
    keywords: ["demandes", "services", "requests"],
    isStarred: true,
  },
  {
    id: "providers",
    title: "Prestataires",
    description: "Gérer les prestataires de services",
    href: "/providers",
    icon: Users,
    category: "Navigation",
    type: "page",
    keywords: ["prestataires", "providers", "utilisateurs"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Analyses et rapports détaillés",
    href: "/analytics",
    icon: BarChart3,
    category: "Navigation",
    type: "page",
    keywords: ["analytics", "analyses", "rapports", "statistiques"],
    isRecent: true,
  },
  {
    id: "finances",
    title: "Finances",
    description: "Gestion financière et facturation",
    href: "/finances",
    icon: CreditCard,
    category: "Navigation",
    type: "page",
    keywords: ["finances", "facturation", "paiements"],
  },
  {
    id: "messages",
    title: "Messages",
    description: "Centre de messagerie",
    href: "/messages",
    icon: MessageSquare,
    category: "Navigation",
    type: "page",
    keywords: ["messages", "chat", "communication"],
  },
  {
    id: "map",
    title: "Carte",
    description: "Vue géographique des services",
    href: "/map",
    icon: Map,
    category: "Navigation",
    type: "page",
    keywords: ["carte", "map", "géographie", "localisation"],
  },
  {
    id: "ai",
    title: "IA Prédictive",
    description: "Intelligence artificielle et prédictions",
    href: "/ai",
    icon: Brain,
    category: "Navigation",
    type: "page",
    keywords: ["ia", "intelligence artificielle", "prédictions", "ai"],
  },

  // Paramètres
  {
    id: "settings-general",
    title: "Paramètres généraux",
    description: "Configuration générale de l'application",
    href: "/settings/general",
    icon: Settings,
    category: "Paramètres",
    type: "setting",
    keywords: ["paramètres", "configuration", "général"],
  },
  {
    id: "settings-notifications",
    title: "Notifications",
    description: "Gérer les notifications",
    href: "/settings/notifications",
    icon: MessageSquare,
    category: "Paramètres",
    type: "setting",
    keywords: ["notifications", "alertes"],
  },
  {
    id: "settings-security",
    title: "Sécurité",
    description: "Paramètres de sécurité",
    href: "/settings/security",
    icon: Settings,
    category: "Paramètres",
    type: "setting",
    keywords: ["sécurité", "mot de passe", "authentification"],
  },

  // Actions rapides
  {
    id: "new-request",
    title: "Nouvelle demande",
    description: "Créer une nouvelle demande de service",
    href: "/requests?action=new",
    icon: FileText,
    category: "Actions rapides",
    type: "action",
    keywords: ["nouvelle", "demande", "créer", "ajouter"],
  },
  {
    id: "add-provider",
    title: "Ajouter prestataire",
    description: "Ajouter un nouveau prestataire",
    href: "/providers?action=add",
    icon: Users,
    category: "Actions rapides",
    type: "action",
    keywords: ["ajouter", "prestataire", "nouveau"],
  },
]

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Show recent and starred items when no query
      const recentItems = searchData.filter((item) => item.isRecent).slice(0, 3)
      const starredItems = searchData.filter((item) => item.isStarred).slice(0, 3)
      return [...recentItems, ...starredItems]
    }

    return searchData.filter((item) => {
      const searchTerm = query.toLowerCase()
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm))
      )
    })
  }, [query])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    filteredResults.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredResults])

  const handleSelect = (item: SearchItem) => {
    router.push(item.href)
    onOpenChange(false)
    setQuery("")
    setSelectedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex])
      }
    }
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "action":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "setting":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {Object.keys(groupedResults).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun résultat trouvé</p>
              <p className="text-sm mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item, index) => {
                      const globalIndex = filteredResults.indexOf(item)
                      return (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={`w-full justify-start h-auto p-3 ${
                            globalIndex === selectedIndex ? "bg-accent" : ""
                          }`}
                          onClick={() => handleSelect(item)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {item.isRecent && <Clock className="h-3 w-3 text-muted-foreground" />}
                              {item.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                            <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                              {item.type === "page" ? "Page" : item.type === "action" ? "Action" : "Config"}
                            </Badge>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!query && (
          <div className="border-t p-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Utilisez ↑↓ pour naviguer, ↵ pour sélectionner</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
                <span>pour ouvrir</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
