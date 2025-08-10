"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { TrendingUp, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AlertCircle } from "lucide-react"

interface ChartSectionProps {
  data?: any
}

export function ChartSection({ data }: ChartSectionProps) {
  // Transform API data format to recharts format
  const transformChartData = (labels: string[] = [], values: number[] = []) => {
    return labels.map((label, index) => ({
      name: label,
      value: values[index] || 0
    }));
  };
  
  // Get chart data from API response or use empty arrays
  const activityData = data?.data?.charts?.activity || { labels: [], data: [] };
  const servicesData = data?.data?.charts?.services || { labels: [], data: [] };
  const revenueData = data?.data?.charts?.revenue || { labels: [], data: [] };
  
  // Transform data for charts
  const transformedActivityData = transformChartData(activityData.labels, activityData.data);
  const transformedRevenueData = transformChartData(revenueData.labels, revenueData.data);
  
  // Create pie chart data with colors
  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#0088fe', '#ff8042', '#aa4de8'];
  const transformedServicesData = servicesData.labels.map((label: any, index: number) => ({
    name: label,
    value: servicesData.data[index] || 0,
    color: pieColors[index % pieColors.length]
  }));

  // Custom tooltip formatter for currency
  const currencyFormatter = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Check if we have data to display
  const hasActivityData = activityData.labels.length > 0 && activityData.data.some((value: number) => value > 0);
  const hasRevenueData = revenueData.labels.length > 0 && revenueData.data.some((value: number) => value > 0);
  const hasServicesData = servicesData.labels.length > 0 && servicesData.data.some((value: number) => value > 0);
  const hasAnyData = hasActivityData || hasRevenueData || hasServicesData;

  // Default tab selection based on available data
  const defaultTab = hasActivityData ? "activity" : (hasServicesData ? "services" : (hasRevenueData ? "revenue" : "activity"));

  // No data placeholder
  const NoDataPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-72 text-gray-500">
      <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
      <p className="text-center">Aucune donnée disponible</p>
      <p className="text-sm text-center mt-2">Les données apparaîtront ici lorsqu'elles seront disponibles</p>
    </div>
  );

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-white">Analyses et tendances</CardTitle>
              <CardDescription className="text-gray-400">Vue d'ensemble des performances de la plateforme</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasAnyData ? (
          <NoDataPlaceholder />
        ) : (
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300"
                disabled={!hasActivityData}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Activités
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300"
                disabled={!hasRevenueData}
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                Revenus
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300"
                disabled={!hasServicesData}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
            </TabsList>

            {hasActivityData && (
              <TabsContent value="activity" className="space-y-4 mt-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transformedActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#aaa' }} axisLine={{ stroke: '#555' }} />
                      <YAxis tick={{ fill: '#aaa' }} axisLine={{ stroke: '#555' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }} 
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                      />
                      <Bar dataKey="value" fill="#7c70f4" name="Demandes" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-center text-gray-400 mt-2">
                  Évolution du nombre de demandes par jour
                </div>
              </TabsContent>
            )}

            {hasRevenueData && (
              <TabsContent value="revenue" className="space-y-4 mt-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transformedRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={true} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#aaa' }} axisLine={{ stroke: '#555' }} />
                      <YAxis tick={{ fill: '#aaa' }} axisLine={{ stroke: '#555' }} />
                      <Tooltip 
                        formatter={(value: any) => [currencyFormatter(value), "Revenus"]}
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }} 
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#7c3aed" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#7c3aed', stroke: '#7c3aed' }}
                        activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-center text-gray-400 mt-2">
                  Évolution des revenus par jour (en FCFA)
                </div>
              </TabsContent>
            )}

            {hasServicesData && (
              <TabsContent value="services" className="space-y-4 mt-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={transformedServicesData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={90}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {transformedServicesData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#222" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }} 
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-center text-gray-400 mt-2">
                  Répartition des demandes par type de service
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}