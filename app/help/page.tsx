"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Book,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  Settings,
  BarChart3,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Download,
  Play,
  Star,
  Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const helpCategories = [
  {
    id: "getting-started",
    title: "Premiers pas",
    icon: Book,
    color: "bg-blue-500",
    articles: [
      {
        title: "Guide de démarrage rapide",
        description: "Apprenez les bases de Djobea Analytics en 5 minutes",
        readTime: "5 min",
        popular: true,
      },
      {
        title: "Configuration initiale",
        description: "Comment configurer votre compte et vos préférences",
        readTime: "10 min",
        popular: false,
      },
      {
        title: "Navigation dans l'interface",
        description: "Découvrez toutes les fonctionnalités de l'interface",
        readTime: "8 min",
        popular: true,
      },
    ],
  },
  {
    id: "requests",
    title: "Gestion des demandes",
    icon: FileText,
    color: "bg-green-500",
    articles: [
      {
        title: "Créer une nouvelle demande",
        description: "Comment créer et configurer une demande de service",
        readTime: "7 min",
        popular: true,
      },
      {
        title: "Suivi des demandes",
        description: "Suivre le statut et l'évolution de vos demandes",
        readTime: "5 min",
        popular: false,
      },
      {
        title: "Gestion des priorités",
        description: "Comment définir et gérer les priorités des demandes",
        readTime: "6 min",
        popular: false,
      },
    ],
  },
  {
    id: "providers",
    title: "Prestataires",
    icon: Users,
    color: "bg-purple-500",
    articles: [
      {
        title: "Ajouter un prestataire",
        description: "Comment ajouter et configurer un nouveau prestataire",
        readTime: "8 min",
        popular: true,
      },
      {
        title: "Évaluation des prestataires",
        description: "Système de notation et d'évaluation",
        readTime: "6 min",
        popular: false,
      },
      {
        title: "Gestion des zones de couverture",
        description: "Configurer les zones d'intervention des prestataires",
        readTime: "10 min",
        popular: false,
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Rapports",
    icon: BarChart3,
    color: "bg-orange-500",
    articles: [
      {
        title: "Comprendre les métriques",
        description: "Guide des indicateurs clés de performance",
        readTime: "12 min",
        popular: true,
      },
      {
        title: "Génération de rapports",
        description: "Comment créer et exporter des rapports personnalisés",
        readTime: "9 min",
        popular: false,
      },
      {
        title: "Tableaux de bord personnalisés",
        description: "Créer vos propres tableaux de bord",
        readTime: "15 min",
        popular: false,
      },
    ],
  },
  {
    id: "finances",
    title: "Finances",
    icon: DollarSign,
    color: "bg-emerald-500",
    articles: [
      {
        title: "Suivi des revenus",
        description: "Comment suivre et analyser vos revenus",
        readTime: "8 min",
        popular: true,
      },
      {
        title: "Gestion des factures",
        description: "Créer et gérer les factures clients",
        readTime: "10 min",
        popular: false,
      },
      {
        title: "Prévisions financières",
        description: "Utiliser les outils de prévision financière",
        readTime: "12 min",
        popular: false,
      },
    ],
  },
  {
    id: "settings",
    title: "Paramètres",
    icon: Settings,
    color: "bg-gray-500",
    articles: [
      {
        title: "Configuration générale",
        description: "Paramètres généraux de l'application",
        readTime: "6 min",
        popular: false,
      },
      {
        title: "Notifications",
        description: "Configurer vos préférences de notification",
        readTime: "5 min",
        popular: true,
      },
      {
        title: "Sécurité et permissions",
        description: "Gérer la sécurité et les accès utilisateurs",
        readTime: "10 min",
        popular: false,
      },
    ],
  },
]

const faqs = [
  {
    question: "Comment créer ma première demande de service ?",
    answer:
      "Pour créer une demande, cliquez sur le bouton 'Nouvelle demande' dans le tableau de bord ou utilisez le raccourci Ctrl+N. Remplissez les informations du client, décrivez le service requis, et sélectionnez la zone d'intervention.",
  },
  {
    question: "Comment ajouter un nouveau prestataire ?",
    answer:
      "Allez dans la section 'Prestataires', cliquez sur 'Ajouter un prestataire', puis remplissez les informations personnelles, les compétences, et les zones de couverture du prestataire.",
  },
  {
    question: "Puis-je personnaliser mon tableau de bord ?",
    answer:
      "Oui, vous pouvez personnaliser votre tableau de bord en cliquant sur l'icône de paramètres en haut à droite. Vous pouvez ajouter, supprimer ou réorganiser les widgets selon vos besoins.",
  },
  {
    question: "Comment exporter mes données ?",
    answer:
      "Vous pouvez exporter vos données depuis chaque section (Demandes, Prestataires, Analytics) en cliquant sur le bouton 'Exporter' et en choisissant le format souhaité (CSV, Excel, PDF).",
  },
  {
    question: "Comment configurer les notifications ?",
    answer:
      "Allez dans Paramètres > Notifications pour configurer vos préférences. Vous pouvez choisir de recevoir des notifications par email, SMS, ou push selon le type d'événement.",
  },
  {
    question: "Que faire si un prestataire ne répond pas ?",
    answer:
      "Si un prestataire ne répond pas dans les délais impartis, le système peut automatiquement réassigner la demande à un autre prestataire disponible selon vos paramètres de configuration.",
  },
]

const supportOptions = [
  {
    title: "Chat en direct",
    description: "Obtenez une aide immédiate via notre chat",
    icon: MessageCircle,
    action: "Démarrer le chat",
    available: true,
  },
  {
    title: "Support téléphonique",
    description: "Appelez-nous au +237 123 456 789",
    icon: Phone,
    action: "Appeler maintenant",
    available: true,
  },
  {
    title: "Email support",
    description: "Envoyez-nous un email à support@djobea.com",
    icon: Mail,
    action: "Envoyer un email",
    available: true,
  },
  {
    title: "Documentation API",
    description: "Guide complet pour les développeurs",
    icon: FileText,
    action: "Voir la documentation",
    available: true,
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return helpCategories

    return helpCategories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((category) => category.articles.length > 0)
  }, [searchQuery])

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Centre d'aide Djobea
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8"
          >
            Trouvez rapidement les réponses à vos questions
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-gray-800 border-gray-700 focus:border-blue-500"
            />
          </motion.div>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-8">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="videos">Vidéos</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-white">Catégories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {helpCategories.map((category) => {
                      const Icon = category.icon
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3 text-left"
                          onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        >
                          <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{category.title}</div>
                            <div className="text-sm text-gray-400">{category.articles.length} articles</div>
                          </div>
                        </Button>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Articles Content */}
              <div className="lg:col-span-2 space-y-6">
                {filteredCategories.map((category) => {
                  if (selectedCategory && selectedCategory !== category.id) return null

                  const Icon = category.icon
                  return (
                    <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="text-white">{category.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {category.articles.map((article, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                    {article.title}
                                  </h3>
                                  {article.popular && (
                                    <Badge variant="secondary" className="bg-blue-600 text-white">
                                      <Star className="w-3 h-3 mr-1" />
                                      Populaire
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">{article.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">{article.readTime}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Questions fréquemment posées</CardTitle>
                <CardDescription className="text-gray-400">
                  Trouvez rapidement les réponses aux questions les plus courantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                      <AccordionTrigger className="text-white hover:text-blue-400">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-300">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Guide de démarrage rapide",
                  duration: "5:32",
                  views: "1.2k vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
                {
                  title: "Créer votre première demande",
                  duration: "3:45",
                  views: "856 vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
                {
                  title: "Gestion des prestataires",
                  duration: "7:21",
                  views: "642 vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
                {
                  title: "Analytics et rapports",
                  duration: "6:18",
                  views: "934 vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
                {
                  title: "Configuration avancée",
                  duration: "9:12",
                  views: "423 vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
                {
                  title: "Intégration API",
                  duration: "12:45",
                  views: "287 vues",
                  thumbnail: "/placeholder.svg?height=200&width=300",
                },
              ].map((video, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden group cursor-pointer">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400">{video.views}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {supportOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-2">{option.title}</h3>
                          <p className="text-gray-400 mb-4">{option.description}</p>
                          <Button className="bg-blue-600 hover:bg-blue-700" disabled={!option.available}>
                            {option.action}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Resources */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ressources supplémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">Guide utilisateur PDF</h4>
                      <p className="text-sm text-gray-400">Documentation complète (2.3 MB)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Télécharger
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="font-medium text-white">Documentation API</h4>
                      <p className="text-sm text-gray-400">Guide complet pour les développeurs</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Consulter
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-white">Communauté</h4>
                      <p className="text-sm text-gray-400">Rejoignez notre forum d'entraide</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Rejoindre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
