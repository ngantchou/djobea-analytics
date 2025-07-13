"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ForecastPanel() {
  // Mock forecast data
  const forecast = {
    nextMonth: {
      revenue: 45000,
      expenses: 32000,
      profit: 13000,
    },
    nextQuarter: {
      revenue: 135000,
      expenses: 96000,
      profit: 39000,
    },
    trends: [
      {
        metric: "Revenus",
        trend: "up",
        percentage: 12,
        description: "Croissance attendue basée sur les tendances actuelles",
      },
      {
        metric: "Dépenses",
        trend: "up",
        percentage: 8,
        description: "Augmentation due aux nouveaux investissements",
      },
      {
        metric: "Marge",
        trend: "up",
        percentage: 3,
        description: "Amélioration de l'efficacité opérationnelle",
      },
    ],
    alerts: [
      {
        type: "warning",
        message: "Budget marketing dépassé de 15% ce mois",
      },
      {
        type: "info",
        message: "Nouveau contrat prévu pour le mois prochain",
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Prévisions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Mois prochain</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Revenus</span>
                <span className="text-green-400">{formatCurrency(forecast.nextMonth.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dépenses</span>
                <span className="text-red-400">{formatCurrency(forecast.nextMonth.expenses)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-white">Bénéfice</span>
                <span className="text-blue-400">{formatCurrency(forecast.nextMonth.profit)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Trimestre prochain</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Revenus</span>
                <span className="text-green-400">{formatCurrency(forecast.nextQuarter.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dépenses</span>
                <span className="text-red-400">{formatCurrency(forecast.nextQuarter.expenses)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-white">Bénéfice</span>
                <span className="text-blue-400">{formatCurrency(forecast.nextQuarter.profit)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Tendances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {forecast.trends.map((trend, index) => {
            const TrendIcon = trend.trend === "up" ? TrendingUp : TrendingDown
            const trendColor = trend.trend === "up" ? "text-green-500" : "text-red-500"

            return (
              <div key={index} className="flex items-start gap-3">
                <TrendIcon className={`h-4 w-4 mt-0.5 ${trendColor}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{trend.metric}</span>
                    <span className={`text-sm ${trendColor}`}>
                      {trend.trend === "up" ? "+" : "-"}
                      {trend.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{trend.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Alertes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {forecast.alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-3">
              <AlertTriangle
                className={`h-4 w-4 mt-0.5 ${alert.type === "warning" ? "text-yellow-500" : "text-blue-500"}`}
              />
              <p className="text-sm text-gray-300">{alert.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
