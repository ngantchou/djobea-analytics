"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, User, FileText, DollarSign, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface Activity {
  id: string
  type: "request" | "provider" | "payment" | "completion"
  title: string
  description: string
  user: string
  timestamp: string
  status: "success" | "pending" | "warning" | "error"
  metadata?: Record<string, any>
}

export function RecentActivity() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getDashboardData()

        if (response.success && response.data?.recentActivity) {
          setActivities(response.data.recentActivity)
        } else {
          // Données par défaut
          setActivities([
            {
              id: "1",
              type: "request",
              title: "Nouvelle demande de plomberie",
              description: "Réparation fuite d'eau - Bonamoussadi",
              user: "Marie Ngo",
              timestamp: "Il y a 5 minutes",
              status: "pending",
            },
            {
              id: "2",
              type: "completion",
              title: "Service terminé",
              description: "Installation électrique complétée",
              user: "Jean Baptiste",
              timestamp: "Il y a 15 minutes",
              status: "success",
            },
            {
              id: "3",
              type: "provider",
              title: "Nouveau prestataire",
              description: "Paul Menuiserie a rejoint la plateforme",
              user: "Paul Essomba",
              timestamp: "Il y a 1 heure",
              status: "success",
            },
            {
              id: "4",
              type: "payment",
              title: "Paiement reçu",
              description: "25,000 FCFA - Service de nettoyage",
              user: "Système",
              timestamp: "Il y a 2 heures",
              status: "success",
            },
            {
              id: "5",
              type: "request",
              title: "Demande urgente",
              description: "Panne électrique - Akwa",
              user: "Pierre Biya",
              timestamp: "Il y a 3 heures",
              status: "warning",
            },
          ])
        }
      } catch (error) {
        logger.error("Erreur lors du chargement de l'activité récente", error)
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "request":
        return FileText
      case "provider":
        return User
      case "payment":
        return DollarSign
      case "completion":
        return CheckCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "warning":
        return "text-orange-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-900/30 text-green-400 border-green-700"
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700"
      case "warning":
        return "bg-orange-900/30 text-orange-400 border-orange-700"
      case "error":
        return "bg-red-900/30 text-red-400 border-red-700"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-700"
    }
  }

  const handleActivityClick = (activity: Activity) => {
    logger.logUserAction("activity_click", { type: activity.type, id: activity.id })

    switch (activity.type) {
      case "request":
        router.push("/requests")
        break
      case "provider":
        router.push("/providers")
        break
      case "payment":
        router.push("/finances")
        break
      case "completion":
        router.push("/requests")
        break
      default:
        router.push("/analytics")
    }
  }

  const handleViewAllActivity = () => {
    logger.logUserAction("view_all_activity")
    router.push("/analytics")
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Activité Récente</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={handleViewAllActivity}>
          Voir tout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer group"
                onClick={() => handleActivityClick(activity)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`${getStatusColor(activity.status)} bg-gray-700`}>
                    <Icon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                    <Badge className={`${getStatusBadge(activity.status)} text-xs`}>{activity.status}</Badge>
                  </div>

                  <p className="text-sm text-gray-400 mb-1">{activity.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Par {activity.user}</span>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune activité récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
