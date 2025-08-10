"use client"

import type React from "react"

import { Bell, Search, User, FileText, Users, BarChart3, Settings, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { GlobalSearch } from "@/components/keyboard/global-search"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/components/notification-provider"
import { useState, useEffect } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface NavigationCounts {
  requests: {
    total: number
    pending: number
    assigned: number
    completed: number
  }
  providers: {
    total: number
    active: number
    inactive: number
    pending: number
  }
  messages: {
    unread: number
    total: number
  }
  notifications: {
    unread: number
  }
}

export function Header() {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [searchOpen, setSearchOpen] = useState(false)
  const [counts, setCounts] = useState<NavigationCounts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true)
        const response = await apiClient.request('/api/navigation/counts', {
          method: 'GET',
          requireAuth: false
        })
        
        if (response.success && response.data) {
          setCounts(response.data)
        }
      } catch (err) {
        logger.error('Error fetching navigation counts:', err)
        // Set fallback counts
        setCounts({
          requests: { total: 12, pending: 8, assigned: 3, completed: 1 },
          providers: { total: 0, active: 0, inactive: 0, pending: 0 },
          messages: { unread: 3, total: 10 },
          notifications: { unread: 0 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSearchClick = () => {
    setSearchOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setSearchOpen(true)
    }
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6" onKeyDown={handleKeyDown}>
        <SidebarTrigger className="-ml-1" />

        <div className="flex-1">
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-muted-foreground pl-8 md:w-2/3 lg:w-1/3 bg-transparent"
                onClick={handleSearchClick}
              >
                Rechercher...
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <Command className="h-3 w-3" />K
                </kbd>
              </Button>
            </div>
          </form>
        </div>

        {/* Quick Action Menus */}
        <div className="flex items-center gap-2">
          {/* Providers Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Prestataires</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Prestataires</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/providers">
                  <Users className="mr-2 h-4 w-4" />
                  Voir tous les prestataires
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/providers?action=add">
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un prestataire
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/providers?status=active">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    Actifs
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/providers?status=inactive">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    Inactifs
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/providers?status=pending">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                    En attente
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Requests Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Demandes</span>
                {counts?.requests?.total && counts.requests.total > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {counts.requests.total}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Demandes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/requests">
                  <FileText className="mr-2 h-4 w-4" />
                  Voir toutes les demandes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests?action=new">
                  <FileText className="mr-2 h-4 w-4" />
                  Nouvelle demande
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/requests?status=pending">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                      En attente
                    </div>
                    {counts?.requests?.pending && counts.requests.pending > 0 && (
                      <Badge variant="outline" className="h-4 px-1 text-xs">
                        {counts.requests.pending}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests?status=assigned">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      Assignées
                    </div>
                    {counts?.requests?.assigned && counts.requests.assigned > 0 && (
                      <Badge variant="outline" className="h-4 px-1 text-xs">
                        {counts.requests.assigned}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/requests?status=completed">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    Terminées
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Analytics Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Analytics</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Tableau de bord
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Rapports</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/analytics?view=performance">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Performance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics?view=geographic">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Géographique
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics?view=services">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Services
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics?view=leaderboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Classement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Export</DropdownMenuLabel>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                Exporter PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                Exporter Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications ({unreadCount})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3 cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{notification.title}</span>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{notification.message}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </DropdownMenuItem>
              ))}
              {notifications.length === 0 && (
                <DropdownMenuItem disabled>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">Aucune notification</div>
                    <div className="text-sm text-muted-foreground">Vous êtes à jour !</div>
                  </div>
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
