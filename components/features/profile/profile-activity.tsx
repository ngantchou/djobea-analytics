"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Settings, FileText, Users, BarChart3, Shield, Bell, Download } from "lucide-react"

interface ActivityItem {
  id: string
  type: "login" | "profile" | "settings" | "request" | "provider" | "analytics" | "security" | "notification" | "export"
  title: string
  description: string
  timestamp: string
  metadata?: {
    ip?: string
    device?: string
    location?: string
    [key: string]: any
  }
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "login",
    title: "Connexion réussie",
    description: "Connexion depuis un nouvel appareil",
    timestamp: "2024-01-15T10:30:00Z",
    metadata: {
      ip: "192.168.1.100",
      device: "Chrome sur Windows",
      location: "Douala, Cameroun",
    },
  },
  {
    id: "2",
    type: "profile",
    title: "Profil mis à jour",
    description: "Modification des informations personnelles",
    timestamp: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    type: "analytics",
    title: "Rapport consulté",
    description: "Consultation du rapport mensuel de performance",
    timestamp: "2024-01-15T08:45:00Z",
  },
  {
    id: "4",
    type: "request",
    title: "Demande assignée",
    description: "Assignation de la demande #REQ-2024-001 à Jean-Baptiste",
    timestamp: "2024-01-14T16:20:00Z",
  },
  {
    id: "5",
    type: "settings",
    title: "Paramètres modifiés",
    description: "Mise à jour des préférences de notification",
    timestamp: "2024-01-14T14:10:00Z",
  },
  {
    id: "6",
    type: "export",
    title: "Export de données",
    description: "Export des données prestataires en format Excel",
    timestamp: "2024-01-14T11:30:00Z",
  },
  {
    id: "7",
    type: "security",
    title: "Sécurité renforcée",
    description: "Activation de l'authentification à deux facteurs",
    timestamp: "2024-01-13T15:45:00Z",
  },
  {
    id: "8",
    type: "provider",
    title: "Nouveau prestataire",
    description: "Ajout du prestataire Marie Plomberie Services",
    timestamp: "2024-01-13T13:20:00Z",
  },
]

export function ProfileActivity() {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return User
      case "profile":
        return User
      case "settings":
        return Settings
      case "request":
        return FileText
      case "provider":
        return Users
      case "analytics":
        return BarChart3
      case "security":
        return Shield
      case "notification":
        return Bell
      case "export":
        return Download
      default:
        return Clock
    }
  }

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return "text-green-400"
      case "profile":
        return "text-blue-400"
      case "settings":
        return "text-purple-400"
      case "request":
        return "text-yellow-400"
      case "provider":
        return "text-cyan-400"
      case "analytics":
        return "text-pink-400"
      case "security":
        return "text-red-400"
      case "notification":
        return "text-orange-400"
      case "export":
        return "text-indigo-400"
      default:
        return "text-gray-400"
    }
  }

  const getActivityBadge = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return { text: "Connexion", color: "bg-green-500/20 text-green-400 border-green-500/30" }
      case "profile":
        return { text: "Profil", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
      case "settings":
        return { text: "Paramètres", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
      case "request":
        return { text: "Demande", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
      case "provider":
        return { text: "Prestataire", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" }
      case "analytics":
        return { text: "Analytics", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" }
      case "security":
        return { text: "Sécurité", color: "bg-red-500/20 text-red-400 border-red-500/30" }
      case "notification":
        return { text: "Notification", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
      case "export":
        return { text: "Export", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" }
      default:
        return { text: "Activité", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Il y a moins d'une heure"
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`
      } else {
        return date.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
    }
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Activité récente
        </CardTitle>
        <CardDescription className="text-gray-400">Historique de vos actions sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mockActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const badge = getActivityBadge(activity.type)

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className={`p-2 rounded-full bg-gray-800 ${getActivityColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                    <Badge variant="outline" className={`text-xs ${badge.color}`}>
                      {badge.text}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-400 mb-2">{activity.description}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>

                    {activity.metadata && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {activity.metadata.device && <span>{activity.metadata.device}</span>}
                        {activity.metadata.location && <span>• {activity.metadata.location}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucune activité récente</p>
            </div>
          )}
        </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Voir toute l'activité
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
