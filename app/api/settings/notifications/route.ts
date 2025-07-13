import { NextResponse } from "next/server"

const defaultNotificationSettings = {
  pushNotifications: {
    enabled: true,
    firebaseServerKey: "",
    soundEnabled: true,
    vibrationEnabled: true,
    badgeEnabled: true,
    quietHours: {
      enabled: true,
      startTime: "22:00",
      endTime: "07:00",
    },
  },
  emailNotifications: {
    enabled: true,
    provider: "sendgrid",
    sendgridApiKey: "",
    fromEmail: "noreply@djobea.com",
    fromName: "Djobea",
    digestEnabled: true,
    digestFrequency: "daily",
    digestTime: "08:00",
  },
  smsNotifications: {
    enabled: true,
    provider: "local",
    orangeApiKey: "",
    mtnApiKey: "",
    dailyLimit: 100,
    costPerSms: 25,
    emergencyOnly: false,
  },
  notificationRules: {
    newRequest: {
      push: true,
      email: true,
      sms: false,
      whatsapp: true,
    },
    providerAssigned: {
      push: true,
      email: false,
      sms: false,
      whatsapp: true,
    },
    requestCompleted: {
      push: true,
      email: true,
      sms: false,
      whatsapp: false,
    },
    paymentReceived: {
      push: true,
      email: true,
      sms: true,
      whatsapp: false,
    },
    systemAlert: {
      push: true,
      email: true,
      sms: true,
      whatsapp: false,
    },
  },
  templates: {
    whatsapp: [
      {
        id: "new_request",
        name: "Nouvelle demande",
        content: "🔔 Nouvelle demande de service: {{service_type}} à {{location}}. Répondez rapidement!",
        variables: ["service_type", "location"],
      },
      {
        id: "request_assigned",
        name: "Demande assignée",
        content: "✅ Votre demande a été assignée à {{provider_name}}. Contact: {{provider_phone}}",
        variables: ["provider_name", "provider_phone"],
      },
    ],
    sms: [
      {
        id: "urgent_request",
        name: "Demande urgente",
        content: "URGENT: Nouvelle demande {{service_type}} à {{location}}. Répondez vite!",
        variables: ["service_type", "location"],
      },
    ],
    email: [
      {
        id: "daily_digest",
        name: "Résumé quotidien",
        subject: "Votre résumé Djobea du {{date}}",
        content: "Bonjour {{user_name}}, voici votre résumé d'activité...",
        variables: ["user_name", "date"],
      },
    ],
  },
}

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(defaultNotificationSettings)
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Here you would typically save to database
    console.log("Saving notification settings:", settings)

    return NextResponse.json({
      success: true,
      message: "Paramètres de notifications sauvegardés avec succès",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Erreur lors de la sauvegarde" }, { status: 500 })
  }
}
