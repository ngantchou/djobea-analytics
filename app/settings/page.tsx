"use client"

import { Suspense } from "react"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { SettingsFloatingActions } from "@/components/settings/settings-floating-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Bell,
  Shield,
  Zap,
  Bot,
  MessageSquare,
  Building,
  Users,
  Database,
  UserCheck,
  Wrench,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

const settingsModules = [
  {
    title: "Général",
    description: "Configuration générale de l'application",
    icon: Settings,
    href: "/settings/general",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    status: "Configuré",
  },
  {
    title: "Notifications",
    description: "Paramètres des notifications et alertes",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    status: "Actif",
  },
  {
    title: "Sécurité",
    description: "Authentification et sécurité",
    icon: Shield,
    href: "/settings/security",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    status: "Sécurisé",
  },
  {
    title: "Performance",
    description: "Optimisation et cache",
    icon: Zap,
    href: "/settings/performance",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    status: "Optimisé",
  },
  {
    title: "Intelligence Artificielle",
    description: "Configuration des fonctionnalités IA",
    icon: Bot,
    href: "/settings/ai",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    status: "Nouveau",
    badge: "Nouveau",
  },
  {
    title: "WhatsApp",
    description: "Intégration WhatsApp Business",
    icon: MessageSquare,
    href: "/settings/whatsapp",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    status: "Connecté",
  },
  {
    title: "Business",
    description: "Paramètres business et opérationnels",
    icon: Building,
    href: "/settings/business",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    status: "Configuré",
  },
  {
    title: "Prestataires",
    description: "Gestion des prestataires",
    icon: Users,
    href: "/settings/providers",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    status: "Actif",
  },
  {
    title: "Demandes",
    description: "Configuration des demandes",
    icon: Database,
    href: "/settings/requests",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    status: "Configuré",
  },
  {
    title: "Administration",
    description: "Paramètres d'administration",
    icon: UserCheck,
    href: "/settings/admin",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    status: "Admin",
  },
  {
    title: "Maintenance",
    description: "Maintenance et déploiement",
    icon: Wrench,
    href: "/settings/maintenance",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    status: "Stable",
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
              <p className="text-gray-400">Gérez la configuration de votre plateforme</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                <Settings className="w-3 h-3 mr-1" />
                11 Modules
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                Tout configuré
              </Badge>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsModules.map((module, index) => {
              const Icon = module.icon
              return (
                <Suspense
                  key={module.href}
                  fallback={
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <div className="h-24 bg-gray-800 rounded-lg animate-pulse" />
                      </CardContent>
                    </Card>
                  }
                >
                  <Link href={module.href}>
                    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-200 group cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${module.bgColor}`}>
                            <Icon className={`w-5 h-5 ${module.color}`} />
                          </div>
                          <div className="flex items-center gap-2">
                            {module.badge && (
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">{module.badge}</Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-400 text-sm mb-3">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`border-gray-600 ${module.color} text-xs`}>
                            {module.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto">
                            Configurer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </Suspense>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start bg-transparent"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Sauvegarder la configuration
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start bg-transparent"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Exporter les paramètres
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 justify-start bg-transparent"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Diagnostics système
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SettingsLayout>

      {/* Floating Actions */}
      <SettingsFloatingActions />
    </div>
  )
}
