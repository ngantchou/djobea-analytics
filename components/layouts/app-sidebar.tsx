"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  MessageSquare,
  Map,
  Brain,
  HelpCircle,
  Shield,
  UserCog,
  Bell,
  Zap,
  Building,
  Wrench,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface MenuItem {
  title: string
  href?: string
  icon: any
  badge?: string
  badgeKey?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  children?: MenuItem[]
  permission?: string
  roles?: string[]
  isNew?: boolean
}

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

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Demandes",
    href: "/requests",
    icon: FileText,
    badgeKey: "requests.total",
    badgeVariant: "destructive",
  },
  {
    title: "Prestataires",
    href: "/providers",
    icon: Users,
    badgeKey: "providers.total",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Finances",
    href: "/finances",
    icon: CreditCard,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
    badgeKey: "messages.unread",
    badgeVariant: "default",
  },
  {
    title: "Carte",
    href: "/map",
    icon: Map,
  },
  {
    title: "IA Prédictive",
    href: "/ai",
    icon: Brain,
    isNew: true,
  },
  {
    title: "Fonctionnalités",
    href: "/features",
    icon: Zap,
  },
  {
    title: "Aide",
    href: "/help",
    icon: HelpCircle,
  },
]

const settingsItems: MenuItem[] = [
  {
    title: "Général",
    href: "/settings/general",
    icon: Settings,
  },
  {
    title: "IA",
    href: "/settings/ai",
    icon: Brain,
    isNew: true,
  },
  {
    title: "WhatsApp",
    href: "/settings/whatsapp",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Sécurité",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Performance",
    href: "/settings/performance",
    icon: Zap,
  },
  {
    title: "Analytics",
    href: "/settings/analytics",
    icon: BarChart3,
  },
  {
    title: "Prestataires",
    href: "/settings/providers",
    icon: Users,
  },
  {
    title: "Demandes",
    href: "/settings/requests",
    icon: FileText,
  },
  {
    title: "Business",
    href: "/settings/business",
    icon: Building,
  },
  {
    title: "Administration",
    href: "/settings/admin",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Maintenance",
    href: "/settings/maintenance",
    icon: Wrench,
    roles: ["admin"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { setOpen, open } = useSidebar()
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
          requests: { total: 0, pending: 0, assigned: 0, completed: 0 },
          providers: { total: 0, active: 0, inactive: 0, pending: 0 },
          messages: { unread: 0, total: 0 },
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

  const getBadgeValue = (item: MenuItem): string | undefined => {
    if (!counts || !item.badgeKey) return item.badge
    
    const keys = item.badgeKey.split('.')
    let value: any = counts
    
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) return item.badge
    }
    
    return value > 0 ? value.toString() : undefined
  }

  const hasPermission = (item: MenuItem) => {
    if (!item.roles && !item.permission) return true
    if (!user) return true // Show all items when no user (for development)

    if (item.roles && !item.roles.includes(user.role)) return false
    if (item.permission && user.permissions && !user.permissions.includes(item.permission)) return false

    return true
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleMenuClick = () => {
    // Auto-collapse sidebar on mobile/tablet when menu item is clicked
    if (window.innerWidth < 1024) {
      setOpen(false)
    }
  }

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b bg-background">
        <div className="flex items-center justify-between px-2 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold hover:bg-accent rounded-md transition-colors p-1"
            onClick={handleMenuClick}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Djobea Analytics</span>
              <span className="text-xs text-muted-foreground">v2.1.0</span>
            </div>
          </Link>

          {/* Collapse Button */}
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="h-8 w-8 shrink-0">
            {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 py-2">
            Navigation principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                if (!hasPermission(item)) return null

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.href!)} className="group relative">
                      <Link
                        href={item.href!}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-accent"
                        onClick={handleMenuClick}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>

                        {item.isNew && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-blue-500" />
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                            >
                              NEW
                            </Badge>
                          </div>
                        )}

                        {getBadgeValue(item) && !item.isNew && (
                          <Badge variant={item.badgeVariant || "secondary"} className="h-5 px-1.5 text-xs font-medium">
                            {getBadgeValue(item)}
                          </Badge>
                        )}

                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 py-2">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => {
                if (!hasPermission(item)) return null

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.href!)} className="group relative">
                      <Link
                        href={item.href!}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-accent"
                        onClick={handleMenuClick}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>

                        {item.isNew && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-blue-500" />
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                            >
                              NEW
                            </Badge>
                          </div>
                        )}

                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 bg-background">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || "Admin"}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-2 p-2 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Statut système</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>En ligne</span>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
