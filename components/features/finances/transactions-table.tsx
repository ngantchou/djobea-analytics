"use client"

import { useFinancesData } from "@/hooks/use-finances-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/utils"
import { Eye, Edit, Trash2 } from "lucide-react"

export function TransactionsTable() {
  const { data: finances, isLoading } = useFinancesData()

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Transactions récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Catégorie</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Montant</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Statut</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {finances?.transactions?.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-gray-300">{formatDate(transaction.date)}</td>
                  <td className="py-3 px-4 text-white font-medium">{transaction.description}</td>
                  <td className="py-3 px-4 text-gray-300">{transaction.category}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={transaction.type === "income" ? "default" : "secondary"}
                      className={transaction.type === "income" ? "bg-green-600" : "bg-red-600"}
                    >
                      {transaction.type === "income" ? "Revenu" : "Dépense"}
                    </Badge>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      transaction.type === "income" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
