import { type NextRequest, NextResponse } from "next/server"

// Simulation d'une base de données en mémoire
let whatsappSettings = {
  config: {
    accountSid: "AC••••••••••••••••••••••••••••••••",
    authToken: "••••••••••••••••••••••••••••••••",
    whatsappNumber: "+14155238886",
    webhookUrl: "https://api.djobea.ai/webhook/whatsapp",
    statusCallbackUrl: "https://api.djobea.ai/webhook/status",
    connectionTimeout: 10,
  },
  messaging: {
    sendDelay: 2,
    dailyLimit: 1000,
    retryAttempts: 3,
    queueSize: 100,
    failureNotifications: true,
    detailedLogs: true,
    devMode: false,
  },
  templates: [],
  lastUpdated: new Date().toISOString(),
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: whatsappSettings,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres WhatsApp:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, messaging, templates } = body

    // Validation des données
    if (!config || !messaging) {
      return NextResponse.json({ success: false, error: "Données manquantes" }, { status: 400 })
    }

    // Validation de la configuration Twilio
    if (!config.accountSid || !config.authToken || !config.whatsappNumber) {
      return NextResponse.json({ success: false, error: "Configuration Twilio incomplète" }, { status: 400 })
    }

    // Validation des paramètres de messaging
    if (messaging.sendDelay < 1 || messaging.sendDelay > 10) {
      return NextResponse.json({ success: false, error: "Délai d'envoi invalide (1-10 secondes)" }, { status: 400 })
    }

    if (messaging.dailyLimit < 100 || messaging.dailyLimit > 10000) {
      return NextResponse.json(
        { success: false, error: "Limite quotidienne invalide (100-10000 messages)" },
        { status: 400 },
      )
    }

    if (messaging.retryAttempts < 1 || messaging.retryAttempts > 5) {
      return NextResponse.json({ success: false, error: "Nombre de tentatives invalide (1-5)" }, { status: 400 })
    }

    if (messaging.queueSize < 10 || messaging.queueSize > 500) {
      return NextResponse.json({ success: false, error: "Taille de queue invalide (10-500 messages)" }, { status: 400 })
    }

    // Validation des templates
    if (templates && Array.isArray(templates)) {
      for (const template of templates) {
        if (!template.name || !template.content) {
          return NextResponse.json(
            { success: false, error: "Template invalide: nom et contenu requis" },
            { status: 400 },
          )
        }

        if (template.name.length > 100) {
          return NextResponse.json(
            { success: false, error: "Nom de template trop long (max 100 caractères)" },
            { status: 400 },
          )
        }

        if (template.content.length > 1000) {
          return NextResponse.json(
            { success: false, error: "Contenu de template trop long (max 1000 caractères)" },
            { status: 400 },
          )
        }
      }
    }

    // Sauvegarde des paramètres
    whatsappSettings = {
      config: {
        ...config,
        connectionTimeout: Number(config.connectionTimeout),
      },
      messaging: {
        ...messaging,
        sendDelay: Number(messaging.sendDelay),
        dailyLimit: Number(messaging.dailyLimit),
        retryAttempts: Number(messaging.retryAttempts),
        queueSize: Number(messaging.queueSize),
      },
      templates: templates || whatsappSettings.templates,
      lastUpdated: new Date().toISOString(),
    }

    // Simulation d'une sauvegarde en base de données
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Paramètres WhatsApp sauvegardés avec succès",
      data: whatsappSettings,
    })
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres WhatsApp:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur lors de la sauvegarde" }, { status: 500 })
  }
}
