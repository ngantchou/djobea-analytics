"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, FileText, Users, BarChart3, Settings, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  description: string
  type: "page" | "provider" | "request" | "setting"
  url: string
  icon: any
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Dashboard",
      description: "Vue d'ensemble des statistiques",
      type: "page",
      url: "/",
      icon: BarChart3,
    },
    {
      id: "2",
      title: "Prestataires",
      description: "Gestion des prestataires de services",
      type: "page",
      url: "/providers",
      icon: Users,
    },
    {
      id: "3",
      title: "Demandes",
      description: "Gestion des demandes de services",
      type: "page",
      url: "/requests",
      icon: FileText,
    },
    {
      id: "4",
      title: "Paramètres généraux",
      description: "Configuration générale de l'application",
      type: "setting",
      url: "/settings/general",
      icon: Settings,
    },
  ]

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()),
      )
      setResults(filtered)
    } else {
      setResults(mockResults.slice(0, 5))
    }
  }, [query])

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    onOpenChange(false)
    setQuery("")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "bg-blue-100 text-blue-800"
      case "provider":
        return "bg-green-100 text-green-800"
      case "request":
        return "bg-yellow-100 text-yellow-800"
      case "setting":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des pages, prestataires, demandes..."
            className="border-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-96">
          {results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => {
                const Icon = result.icon
                return (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 mb-1"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.title}</span>
                          <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Utilisez ↑↓ pour naviguer, ↵ pour sélectionner, Échap pour fermer
        </div>
      </DialogContent>
    </Dialog>
  )
}
