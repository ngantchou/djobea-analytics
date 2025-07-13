"use client"

import { useFinancesData } from "@/hooks/use-finances-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

export function FinancesStats() {
  const { data: finances, isLoading } = useFinancesData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-700 rounded w-1/2" />
                <div className="h-8 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Revenus totaux",
      value: formatCurrency(finances?.totalRevenue || 0),
      change: finances?.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Dépenses totales",
      value: formatCurrency(finances?.totalExpenses || 0),
      change: finances?.expensesChange || 0,
      icon: CreditCard,
      color: "text-red-500",
    },
    {
      title: "Bénéfice net",
      value: formatCurrency(finances?.netProfit || 0),
      change: finances?.profitChange || 0,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Marge bénéficiaire",
      value: formatPercentage(finances?.profitMargin || 0),
      change: finances?.marginChange || 0,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="flex items-center text-xs">
                <TrendIcon className={`mr-1 h-3 w-3 ${isPositive ? "text-green-500" : "text-red-500"}`} />
                <span className={isPositive ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(Math.abs(stat.change))}
                </span>
                <span className="text-gray-400 ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
