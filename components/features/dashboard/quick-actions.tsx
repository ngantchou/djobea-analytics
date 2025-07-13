"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, BarChart3, Settings, Users, FileText, MapPin, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/logger"

export function QuickActions() {
  const router = useRouter()

  const handleNewRequest = () => {
    logger.logUserAction("quick_action_new_request")
    router.push("/requests?action=new")
  }

  const handleViewMessages = () => {
    logger.logUserAction("quick_action_view_messages")
    router.push("/messages")
  }

  const handleViewAnalytics = () => {
    logger.logUserAction("quick_action_view_analytics")
    router.push("/analytics")
  }

  const handleViewSettings = () => {
    logger.logUserAction("quick_action_view_settings")
    router.push("/settings")
  }

  const handleAddProvider = () => {
    logger.logUserAction("quick_action_add_provider")
    router.push("/providers?action=add")
  }

  const handleViewReports = () => {
    logger.logUserAction("quick_action_view_reports")
    router.push("/analytics?tab=reports")
  }

  const handleViewMap = () => {
    logger.logUserAction("quick_action_view_map")
    router.push("/map")
  }

  const handleAIInsights = () => {
    logger.logUserAction("quick_action_ai_insights")
    router.push("/ai")
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={handleNewRequest}
            className="flex flex-col items-center gap-2 h-20 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Nouvelle Demande</span>
          </Button>

          <Button
            onClick={handleViewMessages}
            className="flex flex-col items-center gap-2 h-20 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Messages</span>
          </Button>

          <Button
            onClick={handleViewAnalytics}
            className="flex flex-col items-center gap-2 h-20 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Analytics</span>
          </Button>

          <Button
            onClick={handleViewSettings}
            className="flex flex-col items-center gap-2 h-20 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Paramètres</span>
          </Button>

          <Button
            onClick={handleAddProvider}
            className="flex flex-col items-center gap-2 h-20 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Ajouter Prestataire</span>
          </Button>

          <Button
            onClick={handleViewReports}
            className="flex flex-col items-center gap-2 h-20 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm">Rapports</span>
          </Button>

          <Button
            onClick={handleViewMap}
            className="flex flex-col items-center gap-2 h-20 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Carte</span>
          </Button>

          <Button
            onClick={handleAIInsights}
            className="flex flex-col items-center gap-2 h-20 bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm">IA Insights</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
