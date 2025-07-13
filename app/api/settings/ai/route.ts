import { type NextRequest, NextResponse } from "next/server"

// Simulation d'une base de données en mémoire
let aiSettings = {
  aiConfig: {
    model: "claude-sonnet-4-20250514",
    apiKey:
      "sk-ant-api03-••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••",
    timeout: 5,
    maxTokens: 4000,
    temperature: 0.7,
  },
  conversationConfig: {
    contextMemory: true,
    autoSuggestions: true,
    responseDelay: 1,
    maxConversationLength: 50,
    profanityFilter: true,
    emotionalTone: "professional",
  },
  expressions: [
    { id: "1", text: "Bonjour ! Comment puis-je vous aider ?", category: "salutation" },
    { id: "2", text: "Je comprends votre demande, laissez-moi vous aider.", category: "comprehension" },
    { id: "3", text: "Merci pour votre patience.", category: "politesse" },
    { id: "4", text: "Votre demande a été traitée avec succès.", category: "confirmation" },
  ],
}

export async function GET() {
  try {
    return NextResponse.json(aiSettings)
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres IA:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des paramètres" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données
    if (!body.aiConfig || !body.conversationConfig || !body.expressions) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
    }

    // Validation de la configuration IA
    const { aiConfig, conversationConfig, expressions } = body

    if (!aiConfig.model || !aiConfig.apiKey) {
      return NextResponse.json({ error: "Modèle IA et clé API requis" }, { status: 400 })
    }

    if (aiConfig.timeout < 1 || aiConfig.timeout > 30) {
      return NextResponse.json({ error: "Timeout doit être entre 1 et 30 secondes" }, { status: 400 })
    }

    if (aiConfig.maxTokens < 100 || aiConfig.maxTokens > 8000) {
      return NextResponse.json({ error: "Max tokens doit être entre 100 et 8000" }, { status: 400 })
    }

    if (aiConfig.temperature < 0 || aiConfig.temperature > 1) {
      return NextResponse.json({ error: "Température doit être entre 0 et 1" }, { status: 400 })
    }

    // Validation de la configuration de conversation
    if (conversationConfig.responseDelay < 0 || conversationConfig.responseDelay > 10) {
      return NextResponse.json({ error: "Délai de réponse doit être entre 0 et 10 secondes" }, { status: 400 })
    }

    if (conversationConfig.maxConversationLength < 10 || conversationConfig.maxConversationLength > 200) {
      return NextResponse.json(
        { error: "Longueur max conversation doit être entre 10 et 200 messages" },
        { status: 400 },
      )
    }

    // Validation des expressions
    if (!Array.isArray(expressions)) {
      return NextResponse.json({ error: "Les expressions doivent être un tableau" }, { status: 400 })
    }

    for (const expression of expressions) {
      if (!expression.id || !expression.text || !expression.category) {
        return NextResponse.json(
          { error: "Chaque expression doit avoir un id, un texte et une catégorie" },
          { status: 400 },
        )
      }
    }

    // Sauvegarde des paramètres
    aiSettings = {
      aiConfig: {
        model: aiConfig.model,
        apiKey: aiConfig.apiKey,
        timeout: Number(aiConfig.timeout),
        maxTokens: Number(aiConfig.maxTokens),
        temperature: Number(aiConfig.temperature),
      },
      conversationConfig: {
        contextMemory: Boolean(conversationConfig.contextMemory),
        autoSuggestions: Boolean(conversationConfig.autoSuggestions),
        responseDelay: Number(conversationConfig.responseDelay),
        maxConversationLength: Number(conversationConfig.maxConversationLength),
        profanityFilter: Boolean(conversationConfig.profanityFilter),
        emotionalTone: conversationConfig.emotionalTone,
      },
      expressions: expressions.map((exp: any) => ({
        id: exp.id,
        text: exp.text.trim(),
        category: exp.category,
      })),
    }

    // Simulation d'un délai de sauvegarde
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Paramètres IA sauvegardés avec succès",
      data: aiSettings,
    })
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres IA:", error)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde des paramètres" }, { status: 500 })
  }
}
