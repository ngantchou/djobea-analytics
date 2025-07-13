import { type NextRequest, NextResponse } from "next/server"

interface HelpArticle {
  id: string
  title: string
  description: string
  content: string
  category: string
  readTime: string
  popular: boolean
  lastUpdated: string
  tags: string[]
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
  lastUpdated: string
}

const helpArticles: HelpArticle[] = [
  {
    id: "1",
    title: "Guide de démarrage rapide",
    description: "Apprenez les bases de Djobea Analytics en 5 minutes",
    content: `# Guide de démarrage rapide

Bienvenue sur Djobea Analytics ! Ce guide vous aidera à prendre en main rapidement votre plateforme de gestion de services à domicile.

## Étape 1: Configuration initiale
1. Connectez-vous à votre compte
2. Configurez vos préférences dans les paramètres
3. Ajoutez vos premiers prestataires

## Étape 2: Créer votre première demande
1. Cliquez sur "Nouvelle demande" dans le tableau de bord
2. Remplissez les informations du client
3. Sélectionnez le type de service
4. Assignez un prestataire

## Étape 3: Suivre les performances
1. Consultez le tableau de bord pour les métriques clés
2. Utilisez la section Analytics pour des insights détaillés
3. Générez des rapports personnalisés`,
    category: "getting-started",
    readTime: "5 min",
    popular: true,
    lastUpdated: "2024-01-15",
    tags: ["démarrage", "configuration", "guide"],
  },
  {
    id: "2",
    title: "Configuration initiale",
    description: "Comment configurer votre compte et vos préférences",
    content: `# Configuration initiale

Cette section vous guide dans la configuration de votre compte Djobea Analytics.

## Paramètres généraux
- Informations de l'entreprise
- Préférences de langue et timezone
- Configuration des notifications

## Paramètres de sécurité
- Authentification à deux facteurs
- Gestion des mots de passe
- Journaux d'audit

## Intégrations
- Configuration WhatsApp Business
- Intégration avec les systèmes de paiement
- API et webhooks`,
    category: "getting-started",
    readTime: "10 min",
    popular: false,
    lastUpdated: "2024-01-10",
    tags: ["configuration", "paramètres", "sécurité"],
  },
]

const faqs: FAQ[] = [
  {
    id: "1",
    question: "Comment créer ma première demande de service ?",
    answer:
      "Pour créer une demande, cliquez sur le bouton 'Nouvelle demande' dans le tableau de bord ou utilisez le raccourci Ctrl+N. Remplissez les informations du client, décrivez le service requis, et sélectionnez la zone d'intervention.",
    category: "requests",
    helpful: 45,
    notHelpful: 3,
    lastUpdated: "2024-01-12",
  },
  {
    id: "2",
    question: "Comment ajouter un nouveau prestataire ?",
    answer:
      "Allez dans la section 'Prestataires', cliquez sur 'Ajouter un prestataire', puis remplissez les informations personnelles, les compétences, et les zones de couverture du prestataire.",
    category: "providers",
    helpful: 38,
    notHelpful: 2,
    lastUpdated: "2024-01-08",
  },
  {
    id: "3",
    question: "Puis-je personnaliser mon tableau de bord ?",
    answer:
      "Oui, vous pouvez personnaliser votre tableau de bord en cliquant sur l'icône de paramètres en haut à droite. Vous pouvez ajouter, supprimer ou réorganiser les widgets selon vos besoins.",
    category: "dashboard",
    helpful: 52,
    notHelpful: 1,
    lastUpdated: "2024-01-14",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "articles"
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (type === "articles") {
      let filteredArticles = [...helpArticles]

      if (category) {
        filteredArticles = filteredArticles.filter((article) => article.category === category)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredArticles = filteredArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchLower) ||
            article.description.toLowerCase().includes(searchLower) ||
            article.content.toLowerCase().includes(searchLower) ||
            article.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
        )
      }

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

      return NextResponse.json({
        success: true,
        data: paginatedArticles,
        pagination: {
          page,
          limit,
          total: filteredArticles.length,
          totalPages: Math.ceil(filteredArticles.length / limit),
        },
      })
    }

    if (type === "faqs") {
      let filteredFaqs = [...faqs]

      if (category) {
        filteredFaqs = filteredFaqs.filter((faq) => faq.category === category)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredFaqs = filteredFaqs.filter(
          (faq) => faq.question.toLowerCase().includes(searchLower) || faq.answer.toLowerCase().includes(searchLower),
        )
      }

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedFaqs = filteredFaqs.slice(startIndex, endIndex)

      return NextResponse.json({
        success: true,
        data: paginatedFaqs,
        pagination: {
          page,
          limit,
          total: filteredFaqs.length,
          totalPages: Math.ceil(filteredFaqs.length / limit),
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid type parameter",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Help API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, faqId, helpful } = body

    if (action === "vote") {
      const faq = faqs.find((f) => f.id === faqId)
      if (!faq) {
        return NextResponse.json(
          {
            success: false,
            error: "FAQ not found",
          },
          { status: 404 },
        )
      }

      if (helpful) {
        faq.helpful += 1
      } else {
        faq.notHelpful += 1
      }

      return NextResponse.json({
        success: true,
        data: faq,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Help API POST Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
