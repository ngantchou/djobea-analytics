import { type NextRequest, NextResponse } from "next/server"

interface BusinessSettings {
  // Services Domicile
  fraisDeplacementBase: number
  fraisDeplacementParKm: number
  supplementUrgence: number
  forfaitDiagnostic: number
  garantieTravaux: number

  // Créneaux Horaires
  dureeCreneauStandard: number
  dureeCreneauUrgence: number
  reservationMaxJours: number
  annulationGratuiteHeures: number
  heureOuverture: string
  heureFermeture: string

  // Facturation
  tvaApplicable: number
  numeroFacturePrefix: string
  numeroFactureAnnee: number
  numeroFactureCompteur: number
  archivageDureeAnnees: number
  factureAutomatique: boolean

  // Zones de service
  zonesPrincipales: string[]
  rayonServiceKm: number
  fraisDeplacementSeuil: number
}

// Simulation d'une base de données
let businessSettings: BusinessSettings = {
  // Services Domicile
  fraisDeplacementBase: 500,
  fraisDeplacementParKm: 100,
  supplementUrgence: 25,
  forfaitDiagnostic: 1500,
  garantieTravaux: 30,

  // Créneaux Horaires
  dureeCreneauStandard: 2,
  dureeCreneauUrgence: 1,
  reservationMaxJours: 7,
  annulationGratuiteHeures: 4,
  heureOuverture: "08:00",
  heureFermeture: "18:00",

  // Facturation
  tvaApplicable: 19.25,
  numeroFacturePrefix: "DJB",
  numeroFactureAnnee: 2025,
  numeroFactureCompteur: 1,
  archivageDureeAnnees: 5,
  factureAutomatique: true,

  // Zones de service
  zonesPrincipales: ["Douala", "Yaoundé", "Bafoussam"],
  rayonServiceKm: 40,
  fraisDeplacementSeuil: 5,
}

export async function GET() {
  try {
    // Simulation d'un délai de chargement
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      settings: businessSettings,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        configType: "business",
      },
    })
  } catch (error) {
    console.error("Erreur lors du chargement des paramètres métier:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du chargement des paramètres métier",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSettings: BusinessSettings = await request.json()

    // Validation des données
    const validationErrors = validateBusinessSettings(newSettings)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          validationErrors,
        },
        { status: 400 },
      )
    }

    // Simulation d'un délai de sauvegarde
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mise à jour des paramètres
    businessSettings = { ...newSettings }

    // Log de l'activité
    console.log("Paramètres métier mis à jour:", {
      timestamp: new Date().toISOString(),
      changes: getChangedFields(businessSettings, newSettings),
      user: "admin", // En production, récupérer depuis l'auth
    })

    return NextResponse.json({
      success: true,
      message: "Paramètres métier sauvegardés avec succès",
      settings: businessSettings,
      metadata: {
        savedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    })
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres métier:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la sauvegarde des paramètres métier",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

function validateBusinessSettings(settings: BusinessSettings): string[] {
  const errors: string[] = []

  // Validation frais de déplacement
  if (settings.fraisDeplacementBase < 0) {
    errors.push("Les frais de déplacement de base ne peuvent pas être négatifs")
  }
  if (settings.fraisDeplacementParKm < 0) {
    errors.push("Les frais par km ne peuvent pas être négatifs")
  }
  if (settings.supplementUrgence < 0 || settings.supplementUrgence > 100) {
    errors.push("Le supplément urgence doit être entre 0 et 100%")
  }
  if (settings.forfaitDiagnostic < 0) {
    errors.push("Le forfait diagnostic ne peut pas être négatif")
  }
  if (settings.garantieTravaux < 1 || settings.garantieTravaux > 365) {
    errors.push("La garantie travaux doit être entre 1 et 365 jours")
  }

  // Validation créneaux horaires
  if (settings.dureeCreneauStandard < 1 || settings.dureeCreneauStandard > 8) {
    errors.push("La durée du créneau standard doit être entre 1 et 8 heures")
  }
  if (settings.dureeCreneauUrgence < 1 || settings.dureeCreneauUrgence > 4) {
    errors.push("La durée du créneau urgence doit être entre 1 et 4 heures")
  }
  if (settings.reservationMaxJours < 1 || settings.reservationMaxJours > 30) {
    errors.push("La réservation maximum doit être entre 1 et 30 jours")
  }
  if (settings.annulationGratuiteHeures < 1 || settings.annulationGratuiteHeures > 48) {
    errors.push("L'annulation gratuite doit être entre 1 et 48 heures")
  }

  // Validation horaires
  const heureOuverture = Number.parseInt(settings.heureOuverture.split(":")[0])
  const heureFermeture = Number.parseInt(settings.heureFermeture.split(":")[0])
  if (heureOuverture >= heureFermeture) {
    errors.push("L'heure d'ouverture doit être antérieure à l'heure de fermeture")
  }
  if (heureFermeture - heureOuverture < settings.dureeCreneauStandard) {
    errors.push("La plage horaire doit permettre au moins un créneau standard")
  }

  // Validation facturation
  if (settings.tvaApplicable < 0 || settings.tvaApplicable > 50) {
    errors.push("La TVA doit être entre 0 et 50%")
  }
  if (!settings.numeroFacturePrefix || settings.numeroFacturePrefix.length < 2) {
    errors.push("Le préfixe de facture doit contenir au moins 2 caractères")
  }
  if (settings.numeroFactureAnnee < 2020 || settings.numeroFactureAnnee > 2030) {
    errors.push("L'année de facturation doit être entre 2020 et 2030")
  }
  if (settings.numeroFactureCompteur < 1) {
    errors.push("Le compteur de facture doit être supérieur à 0")
  }
  if (settings.archivageDureeAnnees < 3 || settings.archivageDureeAnnees > 10) {
    errors.push("La durée d'archivage doit être entre 3 et 10 ans")
  }

  // Validation zones de service
  if (!settings.zonesPrincipales || settings.zonesPrincipales.length === 0) {
    errors.push("Au moins une zone principale doit être définie")
  }
  if (settings.rayonServiceKm < 5 || settings.rayonServiceKm > 100) {
    errors.push("Le rayon de service doit être entre 5 et 100 km")
  }
  if (settings.fraisDeplacementSeuil < 0 || settings.fraisDeplacementSeuil > settings.rayonServiceKm) {
    errors.push("Le seuil de frais de déplacement doit être entre 0 et le rayon de service")
  }

  return errors
}

function getChangedFields(oldSettings: BusinessSettings, newSettings: BusinessSettings): string[] {
  const changes: string[] = []

  Object.keys(newSettings).forEach((key) => {
    const typedKey = key as keyof BusinessSettings
    if (JSON.stringify(oldSettings[typedKey]) !== JSON.stringify(newSettings[typedKey])) {
      changes.push(key)
    }
  })

  return changes
}
