"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImplementationStatus } from "@/components/features/roadmap/implementation-status"

export default function RoadmapPage() {
  const phases = [
    {
      id: 1,
      title: "Core Business",
      duration: "2-3 semaines",
      status: "current",
      features: ["Dashboard Drag & Drop", "Carte Interactive", "Recherche Globale"],
      color: "from-red-500 to-orange-500",
    },
    {
      id: 2,
      title: "IA & Productivité",
      duration: "3-4 semaines",
      status: "next",
      features: ["Prédictions IA", "Raccourcis Clavier", "Actions en Lot"],
      color: "from-orange-500 to-yellow-500",
    },
    {
      id: 3,
      title: "Sécurité",
      duration: "2-3 semaines",
      status: "planned",
      features: ["2FA", "Journaux d'Audit", "Gestion Rôles"],
      color: "from-yellow-500 to-green-500",
    },
    {
      id: 4,
      title: "Mobile & Communication",
      duration: "4-5 semaines",
      status: "planned",
      features: ["PWA", "WhatsApp Avancé", "App Mobile"],
      color: "from-green-500 to-blue-500",
    },
    {
      id: 5,
      title: "Analytics Avancés",
      duration: "3-4 semaines",
      status: "planned",
      features: ["Rapports Auto", "Monitoring", "Cohortes"],
      color: "from-blue-500 to-purple-500",
    },
  ]

  const metrics = [
    {
      title: "Durée Totale",
      value: "14-19 semaines",
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      title: "Équipe Requise",
      value: "3-4 devs",
      icon: Users,
      color: "text-green-400",
    },
    {
      title: "Budget Estimé",
      value: "150-200k€",
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      title: "ROI Attendu",
      value: "6 mois",
      icon: Target,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Roadmap d'Implémentation
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Plan détaillé pour l'implémentation des fonctionnalités manquantes de Djobea Analytics
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${metric.color}`} />
                      <div className="text-xl font-bold text-white">{metric.value}</div>
                      <div className="text-sm text-gray-400">{metric.title}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Phases Timeline */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Planning par Phases
              </CardTitle>
              <CardDescription className="text-gray-400">
                Découpage du développement en 5 phases prioritaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center text-white font-bold`}
                      >
                        {phase.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{phase.duration}</span>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                phase.status === "current"
                                  ? "bg-green-500/20 text-green-400"
                                  : phase.status === "next"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {phase.status === "current"
                                ? "En cours"
                                : phase.status === "next"
                                  ? "Suivant"
                                  : "Planifié"}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {phase.features.map((feature) => (
                            <span key={feature} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-md">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < phases.length - 1 && <div className="ml-6 mt-4 w-0.5 h-8 bg-gray-600"></div>}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Implementation Status */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                État d'Implémentation Détaillé
              </CardTitle>
              <CardDescription className="text-gray-400">
                Suivi détaillé de chaque fonctionnalité avec complexité et impact business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImplementationStatus />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
