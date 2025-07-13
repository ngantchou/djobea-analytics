"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
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
  ChevronDown,
  ChevronRight,
  Shield,
  UserCog,
  Bell,
  Zap,
  Building,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth-provider"

interface MenuItem {
  title: string
  href?: string
  icon: any
  badge?: string
  children?: MenuItem[]
  permission?: string
  roles?: string[]
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
    badge: "12",
  },
  {
    title: "Prestataires",
    href: "/providers",
    icon: Users,
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
    badge: "3",
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
  },
  {
    title: "Paramètres",
    icon: Settings,
    children: [
      {
        title: "Général",
        href: "/settings/general",
        icon: Settings,
      },
      {
        title: "IA",
        href: "/settings/ai",
        icon: Brain,
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
    ],
  },
  {
    title: "Aide",
    href: "/help",
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [openItems, setOpenItems] = useState<string[]>(["Paramètres"])

  const toggleItem = (title: string) => {
    setOpenItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
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

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasPermission(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isOpen = openItems.includes(item.title)
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-9 px-2",
                level > 0 && "ml-4",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-2">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 h-9 px-2",
          level > 0 && "ml-4 w-[calc(100%-1rem)]",
          active && "bg-accent text-accent-foreground",
        )}
        asChild
      >
        <Link href={item.href!}>
          <item.icon className="h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          <span>Djobea Analytics</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
      </div>
    </div>
  )
}
