"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  page: string
  action?: () => void
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur Djobea Analytics",
    description: "Découvrez toutes les fonctionnalités de votre plateforme de gestion de services à domicile.",
    target: "body",
    position: "top",
    page: "/",
  },
  {
    id: "dashboard-stats",
    title: "Tableau de Bord Principal",
    description: "Visualisez vos KPIs en temps réel : demandes totales, taux de réussite, prestataires actifs.",
    target: "[data-tour='dashboard-stats']",
    position: "bottom",
    page: "/",
  },
  {
    id: "dashboard-charts",
    title: "Graphiques d'Activité",
    description: "Analysez les tendances avec des graphiques interactifs d'activité et de répartition des services.",
    target: "[data-tour='dashboard-charts']",
    position: "top",
    page: "/",
  },
  {
    id: "recent-activity",
    title: "Activité Récente",
    description: "Suivez les dernières demandes et alertes système en temps réel.",
    target: "[data-tour='recent-activity']",
    position: "top",
    page: "/",
  },
  {
    id: "requests-page",
    title: "Gestion des Demandes",
    description: "Gérez toutes les demandes de service : assignation, suivi, annulation.",
    target: "body",
    position: "top",
    page: "/requests",
  },
  {
    id: "requests-filters",
    title: "Filtres Avancés",
    description: "Filtrez les demandes par statut, service, localisation, priorité et période.",
    target: "[data-tour='requests-filters']",
    position: "bottom",
    page: "/requests",
  },
  {
    id: "requests-table",
    title: "Tableau des Demandes",
    description: "Visualisez et gérez toutes les demandes avec actions rapides intégrées.",
    target: "[data-tour='requests-table']",
    position: "top",
    page: "/requests",
  },
  {
    id: "providers-page",
    title: "Gestion des Prestataires",
    description: "Gérez votre réseau de prestataires : ajout, modification, évaluation.",
    target: "body",
    position: "top",
    page: "/providers",
  },
  {
    id: "providers-stats",
    title: "Statistiques Prestataires",
    description: "Suivez les performances de vos prestataires avec des métriques détaillées.",
    target: "[data-tour='providers-stats']",
    position: "bottom",
    page: "/providers",
  },
  {
    id: "analytics-page",
    title: "Analytics IA",
    description: "Exploitez l'intelligence artificielle pour des insights avancés sur vos performances.",
    target: "body",
    position: "top",
    page: "/analytics",
  },
  {
    id: "analytics-insights",
    title: "Insights IA",
    description: "Découvrez des recommandations intelligentes basées sur vos données.",
    target: "[data-tour='analytics-insights']",
    position: "top",
    page: "/analytics",
  },
  {
    id: "finances-page",
    title: "Gestion Financière",
    description: "Suivez vos revenus, dépenses et prévisions financières.",
    target: "body",
    position: "top",
    page: "/finances",
  },
  {
    id: "settings-page",
    title: "Paramètres Système",
    description: "Configurez tous les aspects de votre plateforme selon vos besoins.",
    target: "body",
    position: "top",
    page: "/settings",
  },
]

interface AppTourProps {
  isOpen: boolean
  onClose: () => void
  autoStart?: boolean
}

export function AppTour({ isOpen, onClose, autoStart = false }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoStart)
  const [currentPage, setCurrentPage] = useState("/")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPage(window.location.pathname)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        if (currentStep < tourSteps.length - 1) {
          nextStep()
        } else {
          setIsPlaying(false)
        }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isOpen, currentStep])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepData = tourSteps[currentStep + 1]
      if (nextStepData.page !== currentPage) {
        window.location.href = nextStepData.page
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepData = tourSteps[currentStep - 1]
      if (prevStepData.page !== currentPage) {
        window.location.href = prevStepData.page
      }
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    const stepData = tourSteps[stepIndex]
    if (stepData.page !== currentPage) {
      window.location.href = stepData.page
    }
    setCurrentStep(stepIndex)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!isOpen) return null

  const currentStepData = tourSteps[currentStep]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        {/* Tour Overlay */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-60"
        >
          <Card className="w-96 bg-slate-900 border-slate-700 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {currentStep + 1} / {tourSteps.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-slate-400 hover:text-white"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{currentStepData.title}</h3>
                <p className="text-slate-300 leading-relaxed">{currentStepData.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Progression</span>
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>

                {currentStep === tourSteps.length - 1 ? (
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Terminer
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center mt-4 gap-1">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep ? "bg-blue-500 w-6" : index < currentStep ? "bg-green-500" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
