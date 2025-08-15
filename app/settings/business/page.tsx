"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import styled from "styled-components"
import { apiRequest, API_PATHS } from "@/lib/api-config"
import {
  ChevronRight,
  Save,
  RotateCcw,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Settings,
  Home,
  Truck,
  Shield,
  Calculator,
  Receipt,
  Archive,
  Download,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/layouts/header"

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--dark-bg);
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(191, 90, 242, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 60% 60%, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
    z-index: -1;
    animation: dataFlow 30s ease-in-out infinite;
  }

  @keyframes dataFlow {
    0%, 100% { opacity: 1; transform: rotate(0deg); }
    25% { opacity: 0.8; transform: rotate(90deg); }
    50% { opacity: 0.6; transform: rotate(180deg); }
    75% { opacity: 0.9; transform: rotate(270deg); }
  }
`

const MainContent = styled.main`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`

const PageHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple), var(--neon-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const PageSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: 2rem;
`

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  justify-content: center;

  a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: var(--text-primary);
    }
  }

  svg {
    color: var(--text-secondary);
    width: 0.8rem;
    height: 0.8rem;
  }
`

const StatusBar = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const StatusIndicator = styled.div<{ status: "online" | "warning" | "offline" }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
  background: ${(props) => {
    switch (props.status) {
      case "online":
        return "var(--neon-green)"
      case "warning":
        return "#ffc107"
      case "offline":
        return "var(--neon-pink)"
      default:
        return "var(--neon-green)"
    }
  }};
  box-shadow: 0 0 10px
    ${(props) => {
      switch (props.status) {
        case "online":
          return "var(--neon-green)"
        case "warning":
          return "#ffc107"
        case "offline":
          return "var(--neon-pink)"
        default:
          return "var(--neon-green)"
      }
    }};
`

const StatusText = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`

const StatusActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

const ActionButton = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-gradient)"
      case "danger":
        return "linear-gradient(135deg, #ff4757, #ff3742)"
      default:
        return "transparent"
    }
  }};
  color: ${(props) => (props.variant === "primary" || props.variant === "danger" ? "white" : "var(--text-secondary)")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => {
      switch (props.variant) {
        case "danger":
          return "linear-gradient(135deg, #ff3742, #ff2f3a)"
        default:
          return "var(--primary-gradient)"
      }
    }};
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const UnsavedChangesBar = styled.div<{ show: boolean }>`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
  z-index: 1000;
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
`

const SettingsSection = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`

const SectionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const SectionInfo = styled.div`
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
    color: var(--text-secondary);
  }
`

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid ${(props) => (props.hasError ? "#ff4757" : "var(--border-color)")};
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#ff4757" : "var(--neon-blue)")};
    box-shadow: 0 0 0 2px ${(props) => (props.hasError ? "rgba(255, 71, 87, 0.2)" : "rgba(0, 212, 255, 0.2)")};
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const Select = styled.select`
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-blue);
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  }

  option {
    background: var(--dark-bg);
    color: var(--text-primary);
  }
`

const TextArea = styled.textarea`
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--neon-blue);
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const Switch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${(props) => (props.checked ? "var(--neon-green)" : "var(--border-color)")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.checked ? "26px" : "2px")};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const ErrorText = styled.div`
  color: #ff4757;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 0.8rem;
    height: 0.8rem;
  }
`

const InfoCard = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
`

const InfoTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;

  .label {
    color: var(--text-secondary);
  }

  .value {
    color: var(--text-primary);
    font-weight: 500;
  }
`

const ZonesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const ZoneItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
`

const ZoneText = styled.span`
  color: var(--text-primary);
  font-size: 0.9rem;
`

const ZoneActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ZoneButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-gradient);
    color: white;
    border-color: transparent;
  }

  svg {
    width: 0.8rem;
    height: 0.8rem;
  }
`

const AddZoneForm = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const PreviewSection = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
`

const PreviewTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const PreviewCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`

const PreviewValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
`

const PreviewLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.8rem;
`

// Modal Styles
const ModalOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const ModalContent = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`

const TestResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const TestResult = styled.div<{ status: "success" | "warning" | "error" }>`
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid
    ${(props) => {
      switch (props.status) {
        case "success":
          return "var(--neon-green)"
        case "warning":
          return "#ffc107"
        case "error":
          return "#ff4757"
        default:
          return "var(--neon-blue)"
      }
    }};
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

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

interface ValidationErrors {
  [key: string]: string
}

export default function BusinessSettingsPage() {
  // État par défaut minimal - sera remplacé par les données de l'API
  const [settings, setSettings] = useState<BusinessSettings>({
    fraisDeplacementBase: 0,
    fraisDeplacementParKm: 0,
    supplementUrgence: 0,
    forfaitDiagnostic: 0,
    garantieTravaux: 0,
    dureeCreneauStandard: 0,
    dureeCreneauUrgence: 0,
    reservationMaxJours: 0,
    annulationGratuiteHeures: 0,
    heureOuverture: "00:00",
    heureFermeture: "00:00",
    tvaApplicable: 0,
    numeroFacturePrefix: "",
    numeroFactureAnnee: 0,
    numeroFactureCompteur: 0,
    archivageDureeAnnees: 0,
    factureAutomatique: false,
    zonesPrincipales: [],
    rayonServiceKm: 0,
    fraisDeplacementSeuil: 0,
  })

  const [originalSettings, setOriginalSettings] = useState<BusinessSettings>(settings)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showResetModal, setShowResetModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [newZone, setNewZone] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(hasChanges)
  }, [settings, originalSettings])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const result = await apiRequest(API_PATHS.SETTINGS.BUSINESS)
      
      if (result.success && result.data?.settings) {
        setSettings(result.data.settings)
        setOriginalSettings(result.data.settings)
      } else {
        console.error("Erreur chargement:", result.error)
        showNotification("Erreur lors du chargement des paramètres", "error")
      }
    } catch (error) {
      console.error("Erreur chargement:", error)
      showNotification("Erreur de connexion à l'API", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const validateSettings = (): boolean => {
    const errors: ValidationErrors = {}

    // Validation frais
    if (settings.fraisDeplacementBase < 0) {
      errors.fraisDeplacementBase = "Les frais de base ne peuvent pas être négatifs"
    }
    if (settings.fraisDeplacementParKm < 0) {
      errors.fraisDeplacementParKm = "Les frais par km ne peuvent pas être négatifs"
    }
    if (settings.supplementUrgence < 0 || settings.supplementUrgence > 100) {
      errors.supplementUrgence = "Le supplément doit être entre 0 et 100%"
    }

    // Validation créneaux
    if (settings.dureeCreneauStandard < 1 || settings.dureeCreneauStandard > 8) {
      errors.dureeCreneauStandard = "La durée doit être entre 1 et 8 heures"
    }
    if (settings.reservationMaxJours < 1 || settings.reservationMaxJours > 30) {
      errors.reservationMaxJours = "La réservation doit être entre 1 et 30 jours"
    }

    // Validation facturation
    if (settings.tvaApplicable < 0 || settings.tvaApplicable > 50) {
      errors.tvaApplicable = "La TVA doit être entre 0 et 50%"
    }
    if (!settings.numeroFacturePrefix.trim()) {
      errors.numeroFacturePrefix = "Le préfixe est obligatoire"
    }
    if (settings.numeroFactureAnnee < 2020 || settings.numeroFactureAnnee > 2030) {
      errors.numeroFactureAnnee = "L'année doit être entre 2020 et 2030"
    }

    // Validation zones
    if (settings.zonesPrincipales.length === 0) {
      errors.zonesPrincipales = "Au moins une zone de service est requise"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof BusinessSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    if (!validateSettings()) {
      showNotification("Veuillez corriger les erreurs avant de sauvegarder", "error")
      return
    }

    setIsLoading(true)
    showNotification("Sauvegarde des paramètres métier...", "info")

    try {
      const result = await apiRequest(API_PATHS.SETTINGS.BUSINESS, {
        method: "POST",
        body: JSON.stringify(settings),
      })

      if (result.success) {
        setOriginalSettings(settings)
        setHasChanges(false)
        showNotification("Paramètres métier sauvegardés avec succès", "success")
      } else {
        throw new Error(result.error || "Erreur serveur")
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error)
      showNotification(`Erreur lors de la sauvegarde: ${error.message || error}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setValidationErrors({})
    setShowResetModal(false)
    showNotification("Paramètres réinitialisés", "success")
  }

  const handleTest = async () => {
    setIsLoading(true)
    setShowTestModal(true)
    setTestResults([])

    try {
      const result = await apiRequest(API_PATHS.SETTINGS.BUSINESS_TEST, {
        method: "POST",
      })

      if (result.success && result.data?.tests) {
        // Simuler l'affichage progressif des résultats
        result.data.tests.forEach((test: any, index: number) => {
          setTimeout(() => {
            setTestResults((prev) => [...prev, test])
            
            if (index === result.data.tests.length - 1) {
              setIsLoading(false)
              showNotification("Tests terminés avec succès", "success")
            }
          }, (index + 1) * 800)
        })
      } else {
        setIsLoading(false)
        showNotification("Erreur lors du test de configuration", "error")
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Erreur test:", error)
      showNotification("Erreur de connexion lors des tests", "error")
    }
  }

  const handleExport = async () => {
    try {
      const result = await apiRequest(API_PATHS.SETTINGS.BUSINESS_EXPORT, {
        method: "POST",
      })

      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data.settings, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.data.filename || `business-settings-${new Date().toISOString().split("T")[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
        setShowExportModal(false)
        showNotification("Configuration exportée avec succès", "success")
      } else {
        showNotification("Erreur lors de l'export", "error")
      }
    } catch (error) {
      console.error("Erreur export:", error)
      showNotification("Erreur lors de l'export", "error")
    }
  }

  const handleImport = (jsonData: string) => {
    try {
      const importedSettings = JSON.parse(jsonData)

      // Validation basique de la structure
      const requiredFields = ["fraisDeplacementBase", "tvaApplicable", "zonesPrincipales"]
      const missingFields = requiredFields.filter((field) => !(field in importedSettings))

      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(", ")}`)
      }

      setSettings({ ...settings, ...importedSettings })
      setShowImportModal(false)
      showNotification("Configuration importée avec succès", "success")
    } catch (error) {
      showNotification(`Erreur d'import: ${error.message}`, "error")
    }
  }

  const addZone = () => {
    if (newZone.trim() && !settings.zonesPrincipales.includes(newZone.trim())) {
      handleInputChange("zonesPrincipales", [...settings.zonesPrincipales, newZone.trim()])
      setNewZone("")
    }
  }

  const removeZone = (index: number) => {
    const newZones = settings.zonesPrincipales.filter((_, i) => i !== index)
    handleInputChange("zonesPrincipales", newZones)
  }

  function showNotification(message: string, type: "info" | "success" | "warning" | "error") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `

    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(26, 31, 46, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #667eea;
      backdrop-filter: blur(10px);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `

    switch (type) {
      case "success":
        notification.style.borderLeftColor = "#4caf50"
        break
      case "warning":
        notification.style.borderLeftColor = "#ffc107"
        break
      case "error":
        notification.style.borderLeftColor = "#f44336"
        break
      default:
        notification.style.borderLeftColor = "#667eea"
    }

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 4000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>

      <UnsavedChangesBar show={hasChanges}>
        <AlertTriangle />
        <span>Vous avez des modifications non sauvegardées</span>
      </UnsavedChangesBar>

      <MainContent>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <PageHeader>
              <Breadcrumb>
                <Link href="/">Dashboard</Link>
                <ChevronRight size={12} />
                <Link href="/settings">Paramètres</Link>
                <ChevronRight size={12} />
                <span>Paramètres Métier</span>
              </Breadcrumb>

              <PageTitle>Paramètres Métier Spécifiques</PageTitle>
              <PageSubtitle>Configuration des services domicile, facturation et créneaux horaires</PageSubtitle>
            </PageHeader>
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatusBar>
              <StatusInfo>
                <StatusIndicator status="online" />
                <StatusText>
                  <h3>Configuration Métier Active</h3>
                  <p>Paramètres business opérationnels</p>
                </StatusText>
              </StatusInfo>

              <StatusActions>
                <ActionButton onClick={() => setShowExportModal(true)} disabled={isLoading}>
                  <Download />
                  Exporter
                </ActionButton>
                <ActionButton onClick={() => setShowImportModal(true)} disabled={isLoading}>
                  <Upload />
                  Importer
                </ActionButton>
                <ActionButton onClick={handleTest} disabled={isLoading}>
                  <TestTube />
                  Tester Config
                </ActionButton>
                <ActionButton onClick={() => setShowResetModal(true)} disabled={isLoading || !hasChanges}>
                  <RotateCcw />
                  Réinitialiser
                </ActionButton>
                <ActionButton variant="primary" onClick={handleSave} disabled={isLoading || !hasChanges}>
                  <Save />
                  {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                </ActionButton>
              </StatusActions>
            </StatusBar>
          </motion.div>

          <SettingsGrid>
            {/* Services Domicile */}
            <motion.div variants={itemVariants}>
              <SettingsSection>
                <SectionHeader>
                  <SectionIcon>
                    <Home />
                  </SectionIcon>
                  <SectionInfo>
                    <h2>Services à Domicile</h2>
                    <p>Configuration des frais de déplacement et garanties</p>
                  </SectionInfo>
                </SectionHeader>

                <FormGrid>
                  <FormGroup>
                    <Label>
                      <Truck />
                      Frais de déplacement de base (XAF)
                    </Label>
                    <Input
                      type="number"
                      value={settings.fraisDeplacementBase}
                      onChange={(e) => handleInputChange("fraisDeplacementBase", Number.parseInt(e.target.value))}
                      placeholder="500"
                      hasError={!!validationErrors.fraisDeplacementBase}
                    />
                    {validationErrors.fraisDeplacementBase && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.fraisDeplacementBase}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <MapPin />
                      Frais par km supplémentaire (XAF)
                    </Label>
                    <Input
                      type="number"
                      value={settings.fraisDeplacementParKm}
                      onChange={(e) => handleInputChange("fraisDeplacementParKm", Number.parseInt(e.target.value))}
                      placeholder="100"
                      hasError={!!validationErrors.fraisDeplacementParKm}
                    />
                    {validationErrors.fraisDeplacementParKm && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.fraisDeplacementParKm}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <AlertTriangle />
                      Supplément urgence (%)
                    </Label>
                    <Input
                      type="number"
                      value={settings.supplementUrgence}
                      onChange={(e) => handleInputChange("supplementUrgence", Number.parseInt(e.target.value))}
                      placeholder="25"
                      hasError={!!validationErrors.supplementUrgence}
                    />
                    {validationErrors.supplementUrgence && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.supplementUrgence}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Settings />
                      Forfait diagnostic (XAF)
                    </Label>
                    <Input
                      type="number"
                      value={settings.forfaitDiagnostic}
                      onChange={(e) => handleInputChange("forfaitDiagnostic", Number.parseInt(e.target.value))}
                      placeholder="1500"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Shield />
                      Garantie travaux (jours)
                    </Label>
                    <Input
                      type="number"
                      value={settings.garantieTravaux}
                      onChange={(e) => handleInputChange("garantieTravaux", Number.parseInt(e.target.value))}
                      placeholder="30"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <MapPin />
                      Seuil gratuit déplacement (km)
                    </Label>
                    <Input
                      type="number"
                      value={settings.fraisDeplacementSeuil}
                      onChange={(e) => handleInputChange("fraisDeplacementSeuil", Number.parseInt(e.target.value))}
                      placeholder="5"
                    />
                  </FormGroup>
                </FormGrid>

                <InfoCard>
                  <InfoTitle>Calcul automatique des frais</InfoTitle>
                  <InfoContent>
                    <InfoItem>
                      <span className="label">Distance ≤ {settings.fraisDeplacementSeuil}km:</span>
                      <span className="value">Gratuit</span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Distance &gt; {settings.fraisDeplacementSeuil}km:</span>
                      <span className="value">
                        {settings.fraisDeplacementBase} + {settings.fraisDeplacementParKm} XAF/km
                      </span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Urgence (supplément):</span>
                      <span className="value">+{settings.supplementUrgence}% du tarif total</span>
                    </InfoItem>
                  </InfoContent>
                </InfoCard>
              </SettingsSection>
            </motion.div>

            {/* Créneaux Horaires */}
            <motion.div variants={itemVariants}>
              <SettingsSection>
                <SectionHeader>
                  <SectionIcon>
                    <Calendar />
                  </SectionIcon>
                  <SectionInfo>
                    <h2>Créneaux Horaires</h2>
                    <p>Configuration des plages de réservation et annulations</p>
                  </SectionInfo>
                </SectionHeader>

                <FormGrid>
                  <FormGroup>
                    <Label>
                      <Clock />
                      Durée créneau standard (heures)
                    </Label>
                    <Select
                      value={settings.dureeCreneauStandard}
                      onChange={(e) => handleInputChange("dureeCreneauStandard", Number.parseInt(e.target.value))}
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                      <option value={3}>3 heures</option>
                      <option value={4}>4 heures</option>
                    </Select>
                    {validationErrors.dureeCreneauStandard && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.dureeCreneauStandard}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <AlertTriangle />
                      Durée créneau urgence (heures)
                    </Label>
                    <Select
                      value={settings.dureeCreneauUrgence}
                      onChange={(e) => handleInputChange("dureeCreneauUrgence", Number.parseInt(e.target.value))}
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Calendar />
                      Réservation maximum (jours à l'avance)
                    </Label>
                    <Input
                      type="number"
                      value={settings.reservationMaxJours}
                      onChange={(e) => handleInputChange("reservationMaxJours", Number.parseInt(e.target.value))}
                      placeholder="7"
                      hasError={!!validationErrors.reservationMaxJours}
                    />
                    {validationErrors.reservationMaxJours && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.reservationMaxJours}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Clock />
                      Annulation gratuite (heures avant)
                    </Label>
                    <Input
                      type="number"
                      value={settings.annulationGratuiteHeures}
                      onChange={(e) => handleInputChange("annulationGratuiteHeures", Number.parseInt(e.target.value))}
                      placeholder="4"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Clock />
                      Heure d'ouverture
                    </Label>
                    <Input
                      type="time"
                      value={settings.heureOuverture}
                      onChange={(e) => handleInputChange("heureOuverture", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Clock />
                      Heure de fermeture
                    </Label>
                    <Input
                      type="time"
                      value={settings.heureFermeture}
                      onChange={(e) => handleInputChange("heureFermeture", e.target.value)}
                    />
                  </FormGroup>
                </FormGrid>

                <InfoCard>
                  <InfoTitle>Créneaux disponibles</InfoTitle>
                  <InfoContent>
                    <InfoItem>
                      <span className="label">Horaires de service:</span>
                      <span className="value">
                        {settings.heureOuverture} - {settings.heureFermeture}
                      </span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Créneaux par jour:</span>
                      <span className="value">
                        {Math.floor(
                          (Number.parseInt(settings.heureFermeture.split(":")[0]) -
                            Number.parseInt(settings.heureOuverture.split(":")[0])) /
                            settings.dureeCreneauStandard,
                        )}{" "}
                        créneaux standards
                      </span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Politique d'annulation:</span>
                      <span className="value">Gratuite {settings.annulationGratuiteHeures}h avant</span>
                    </InfoItem>
                  </InfoContent>
                </InfoCard>
              </SettingsSection>
            </motion.div>

            {/* Facturation */}
            <motion.div variants={itemVariants}>
              <SettingsSection>
                <SectionHeader>
                  <SectionIcon>
                    <Receipt />
                  </SectionIcon>
                  <SectionInfo>
                    <h2>Facturation</h2>
                    <p>Configuration TVA, numérotation et archivage des factures</p>
                  </SectionInfo>
                </SectionHeader>

                <FormGrid>
                  <FormGroup>
                    <Label>
                      <Calculator />
                      TVA applicable (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.tvaApplicable}
                      onChange={(e) => handleInputChange("tvaApplicable", Number.parseFloat(e.target.value))}
                      placeholder="19.25"
                      hasError={!!validationErrors.tvaApplicable}
                    />
                    {validationErrors.tvaApplicable && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.tvaApplicable}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FileText />
                      Préfixe numéro facture
                    </Label>
                    <Input
                      type="text"
                      value={settings.numeroFacturePrefix}
                      onChange={(e) => handleInputChange("numeroFacturePrefix", e.target.value)}
                      placeholder="DJB"
                      hasError={!!validationErrors.numeroFacturePrefix}
                    />
                    {validationErrors.numeroFacturePrefix && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.numeroFacturePrefix}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Calendar />
                      Année facturation
                    </Label>
                    <Input
                      type="number"
                      value={settings.numeroFactureAnnee}
                      onChange={(e) => handleInputChange("numeroFactureAnnee", Number.parseInt(e.target.value))}
                      placeholder="2025"
                      hasError={!!validationErrors.numeroFactureAnnee}
                    />
                    {validationErrors.numeroFactureAnnee && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.numeroFactureAnnee}
                      </ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <FileText />
                      Compteur actuel
                    </Label>
                    <Input
                      type="number"
                      value={settings.numeroFactureCompteur}
                      onChange={(e) => handleInputChange("numeroFactureCompteur", Number.parseInt(e.target.value))}
                      placeholder="1"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <Archive />
                      Durée archivage (années)
                    </Label>
                    <Select
                      value={settings.archivageDureeAnnees}
                      onChange={(e) => handleInputChange("archivageDureeAnnees", Number.parseInt(e.target.value))}
                    >
                      <option value={3}>3 ans</option>
                      <option value={5}>5 ans</option>
                      <option value={7}>7 ans</option>
                      <option value={10}>10 ans</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <CheckCircle />
                      Génération automatique
                    </Label>
                    <Switch
                      checked={settings.factureAutomatique}
                      onClick={() => handleInputChange("factureAutomatique", !settings.factureAutomatique)}
                    />
                  </FormGroup>
                </FormGrid>

                <InfoCard>
                  <InfoTitle>Format de numérotation</InfoTitle>
                  <InfoContent>
                    <InfoItem>
                      <span className="label">Prochaine facture:</span>
                      <span className="value">
                        {settings.numeroFacturePrefix}-{settings.numeroFactureAnnee}-
                        {settings.numeroFactureCompteur.toString().padStart(4, "0")}
                      </span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">TVA camerounaise:</span>
                      <span className="value">{settings.tvaApplicable}% (conforme loi)</span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Archivage obligatoire:</span>
                      <span className="value">{settings.archivageDureeAnnees} ans minimum</span>
                    </InfoItem>
                  </InfoContent>
                </InfoCard>
              </SettingsSection>
            </motion.div>

            {/* Zones de Service */}
            <motion.div variants={itemVariants}>
              <SettingsSection>
                <SectionHeader>
                  <SectionIcon>
                    <MapPin />
                  </SectionIcon>
                  <SectionInfo>
                    <h2>Zones de Service</h2>
                    <p>Configuration des zones géographiques couvertes</p>
                  </SectionInfo>
                </SectionHeader>

                <FormGrid>
                  <FormGroup>
                    <Label>
                      <MapPin />
                      Rayon de service (km)
                    </Label>
                    <Input
                      type="number"
                      value={settings.rayonServiceKm}
                      onChange={(e) => handleInputChange("rayonServiceKm", Number.parseInt(e.target.value))}
                      placeholder="40"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <MapPin />
                      Zones principales
                    </Label>
                    <ZonesList>
                      {settings.zonesPrincipales.map((zone, index) => (
                        <ZoneItem key={index}>
                          <ZoneText>{zone}</ZoneText>
                          <ZoneActions>
                            <ZoneButton onClick={() => removeZone(index)}>
                              <Trash2 />
                            </ZoneButton>
                          </ZoneActions>
                        </ZoneItem>
                      ))}
                    </ZonesList>
                    <AddZoneForm>
                      <Input
                        type="text"
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                        placeholder="Nouvelle zone..."
                        onKeyPress={(e) => e.key === "Enter" && addZone()}
                      />
                      <ActionButton onClick={addZone} disabled={!newZone.trim()}>
                        <Plus />
                        Ajouter
                      </ActionButton>
                    </AddZoneForm>
                    {validationErrors.zonesPrincipales && (
                      <ErrorText>
                        <AlertTriangle />
                        {validationErrors.zonesPrincipales}
                      </ErrorText>
                    )}
                  </FormGroup>
                </FormGrid>

                <InfoCard>
                  <InfoTitle>Couverture géographique</InfoTitle>
                  <InfoContent>
                    <InfoItem>
                      <span className="label">Zones configurées:</span>
                      <span className="value">{settings.zonesPrincipales.length} zones</span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Rayon maximum:</span>
                      <span className="value">{settings.rayonServiceKm} km</span>
                    </InfoItem>
                    <InfoItem>
                      <span className="label">Surface couverte:</span>
                      <span className="value">
                        ≈ {Math.round(Math.PI * settings.rayonServiceKm * settings.rayonServiceKm)} km²
                      </span>
                    </InfoItem>
                  </InfoContent>
                </InfoCard>
              </SettingsSection>
            </motion.div>
          </SettingsGrid>

          {/* Preview Section */}
          <motion.div variants={itemVariants}>
            <PreviewSection>
              <PreviewTitle>
                <FileText />
                Aperçu Configuration Métier
              </PreviewTitle>

              <PreviewGrid>
                <PreviewCard>
                  <PreviewValue>{settings.fraisDeplacementBase} XAF</PreviewValue>
                  <PreviewLabel>Frais déplacement base</PreviewLabel>
                </PreviewCard>

                <PreviewCard>
                  <PreviewValue>{settings.dureeCreneauStandard}h</PreviewValue>
                  <PreviewLabel>Créneaux standards</PreviewLabel>
                </PreviewCard>

                <PreviewCard>
                  <PreviewValue>{settings.tvaApplicable}%</PreviewValue>
                  <PreviewLabel>TVA applicable</PreviewLabel>
                </PreviewCard>

                <PreviewCard>
                  <PreviewValue>{settings.garantieTravaux}j</PreviewValue>
                  <PreviewLabel>Garantie travaux</PreviewLabel>
                </PreviewCard>

                <PreviewCard>
                  <PreviewValue>{settings.reservationMaxJours}j</PreviewValue>
                  <PreviewLabel>Réservation max</PreviewLabel>
                </PreviewCard>

                <PreviewCard>
                  <PreviewValue>{settings.archivageDureeAnnees} ans</PreviewValue>
                  <PreviewLabel>Archivage factures</PreviewLabel>
                </PreviewCard>
              </PreviewGrid>
            </PreviewSection>
          </motion.div>
        </motion.div>
      </MainContent>

      {/* Reset Modal */}
      <ModalOverlay show={showResetModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <RotateCcw />
              Réinitialiser la Configuration
            </ModalTitle>
            <CloseButton onClick={() => setShowResetModal(false)}>
              <X />
            </CloseButton>
          </ModalHeader>

          <div>
            <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
              Êtes-vous sûr de vouloir réinitialiser tous les paramètres métier ? Cette action annulera toutes les
              modifications non sauvegardées.
            </p>
            <div
              style={{
                padding: "1rem",
                background: "rgba(255, 71, 87, 0.1)",
                border: "1px solid rgba(255, 71, 87, 0.3)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle style={{ color: "#ff4757", width: "1rem", height: "1rem" }} />
              <span style={{ color: "#ff4757", fontSize: "0.9rem" }}>Cette action est irréversible</span>
            </div>
          </div>

          <ModalActions>
            <ActionButton onClick={() => setShowResetModal(false)}>Annuler</ActionButton>
            <ActionButton variant="danger" onClick={handleReset}>
              <RotateCcw />
              Réinitialiser
            </ActionButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Test Modal */}
      <ModalOverlay show={showTestModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <TestTube />
              Tests de Configuration
            </ModalTitle>
            <CloseButton onClick={() => setShowTestModal(false)}>
              <X />
            </CloseButton>
          </ModalHeader>

          <TestResults>
            {testResults.map((result, index) => (
              <TestResult key={index} status={result.status}>
                {result.status === "success" && <CheckCircle />}
                {result.status === "warning" && <AlertTriangle />}
                {result.status === "error" && <X />}
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{result.name}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{result.message}</div>
                  {result.details && (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      {result.details}
                    </div>
                  )}
                </div>
              </TestResult>
            ))}

            {isLoading && testResults.length < 5 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: "1rem",
                    height: "1rem",
                    border: "2px solid var(--border-color)",
                    borderTop: "2px solid var(--neon-blue)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Tests en cours...
              </div>
            )}
          </TestResults>

          <ModalActions>
            <ActionButton onClick={() => setShowTestModal(false)}>Fermer</ActionButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Export Modal */}
      <ModalOverlay show={showExportModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <Download />
              Exporter la Configuration
            </ModalTitle>
            <CloseButton onClick={() => setShowExportModal(false)}>
              <X />
            </CloseButton>
          </ModalHeader>

          <div>
            <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
              Télécharger la configuration actuelle des paramètres métier au format JSON.
            </p>
            <div
              style={{
                padding: "1rem",
                background: "var(--glass-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Fichier:</strong> business-settings-{new Date().toISOString().split("T")[0]}.json
              </div>
              <div>
                <strong>Contenu:</strong> Tous les paramètres métier actuels
              </div>
            </div>
          </div>

          <ModalActions>
            <ActionButton onClick={() => setShowExportModal(false)}>Annuler</ActionButton>
            <ActionButton variant="primary" onClick={handleExport}>
              <Download />
              Télécharger
            </ActionButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Import Modal */}
      <ModalOverlay show={showImportModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <Upload />
              Importer une Configuration
            </ModalTitle>
            <CloseButton onClick={() => setShowImportModal(false)}>
              <X />
            </CloseButton>
          </ModalHeader>

          <div>
            <FormGroup>
              <Label>Fichier de configuration JSON</Label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const content = event.target?.result as string
                      handleImport(content)
                    }
                    reader.readAsText(file)
                  }
                }}
              />
            </FormGroup>

            <div style={{ margin: "1rem 0", textAlign: "center", color: "var(--text-secondary)" }}>ou</div>

            <FormGroup>
              <Label>Coller le JSON directement</Label>
              <TextArea
                placeholder="Collez ici le contenu JSON de la configuration..."
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handleImport(e.target.value)
                  }
                }}
              />
            </FormGroup>
          </div>

          <ModalActions>
            <ActionButton onClick={() => setShowImportModal(false)}>Annuler</ActionButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  )
}
