"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import styled from "styled-components"
import {
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  Zap,
  Timer,
  Award,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  RefreshCw,
  ChevronRight,
  Save,
  Bell,
  TestTube,
  Download,
  Upload,
  FileText,
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

const ConfigSection = styled.div`
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  margin-bottom: 2rem;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: var(--neon-blue);
  }
`

const StatusBadge = styled.div<{ status: "active" | "paused" | "error" }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${(props) => {
    switch (props.status) {
      case "active":
        return `
          background: rgba(0, 255, 136, 0.2);
          color: var(--neon-green);
          border: 1px solid rgba(0, 255, 136, 0.3);
        `
      case "paused":
        return `
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        `
      case "error":
        return `
          background: rgba(255, 0, 128, 0.2);
          color: var(--neon-pink);
          border: 1px solid rgba(255, 0, 128, 0.3);
        `
    }
  }}

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`

const ConfigCard = styled.div`
  background: var(--glass-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow);
  }
`

const ConfigHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const ConfigIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const ConfigInfo = styled.div`
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

const ConfigContent = styled.div`
  margin-bottom: 1.5rem;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-blue);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-blue);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  option {
    background: var(--dark-bg);
    color: var(--text-primary);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-blue);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
`

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--glass-bg);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--neon-blue);
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--neon-blue);
    cursor: pointer;
    border: none;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }
`

const SliderValue = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--neon-blue);
`

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  margin-left: auto;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--glass-bg);
    transition: 0.3s;
    border-radius: 34px;
    border: 1px solid var(--border-color);

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: var(--text-secondary);
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background: var(--primary-gradient);
    border-color: var(--neon-blue);
  }

  input:checked + span:before {
    transform: translateX(22px);
    background-color: white;
  }
`

const SwitchGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const ValidationRules = styled.div`
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
`

const RuleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`

const RuleLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`

const RuleValue = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
          border-color: transparent;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
          }
        `
      case "danger":
        return `
          background: rgba(255, 0, 128, 0.2);
          color: var(--neon-pink);
          border-color: rgba(255, 0, 128, 0.3);
          
          &:hover {
            background: var(--neon-pink);
            color: white;
          }
        `
      default:
        return `
          background: var(--glass-bg);
          color: var(--text-secondary);
          
          &:hover {
            background: var(--primary-gradient);
            color: white;
            border-color: transparent;
          }
        `
    }
  }}

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const TestSection = styled.div`
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-top: 1.5rem;
`

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const TestResult = styled.div<{ status: "success" | "error" | "pending" }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  
  ${(props) => {
    switch (props.status) {
      case "success":
        return `
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: var(--neon-green);
        `
      case "error":
        return `
          background: rgba(255, 0, 128, 0.1);
          border: 1px solid rgba(255, 0, 128, 0.3);
          color: var(--neon-pink);
        `
      case "pending":
        return `
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          color: #ffc107;
        `
    }
  }}
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`

// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const ModalContent = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;

  &:hover {
    color: var(--text-primary);
    background: var(--glass-bg);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const DocumentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--glass-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`

const DocumentName = styled.span`
  color: var(--text-primary);
  font-size: 0.9rem;
`

const RemoveDocBtn = styled.button`
  background: none;
  border: none;
  color: var(--neon-pink);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 0, 128, 0.1);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const AddDocumentForm = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`

interface ProviderSettings {
  validation: {
    autoApproval: boolean
    minRating: number
    requiredDocuments: string[]
    trialPeriod: number
    backgroundCheck: boolean
  }
  rating: {
    minRating: number
    maxRating: number
    suspensionThreshold: number
    probationThreshold: number
    reviewPeriod: number
  }
  availability: {
    responseTimeout: number
    workingHours: {
      start: string
      end: string
    }
    maxSimultaneousJobs: number
    restBetweenJobs: number
  }
  commission: {
    standardRate: number
    premiumRate: number
    newProviderRate: number
    bonusSystem: boolean
  }
  notifications: {
    newRequestAlert: boolean
    ratingAlert: boolean
    paymentAlert: boolean
    systemUpdates: boolean
  }
}

export default function ProviderSettingsPage() {
  // Utility functions
  const showNotification = (message: string, type: "info" | "success" | "warning" | "error") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-bell"></i>
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

  const [settings, setSettings] = useState<ProviderSettings>({
    validation: {
      autoApproval: false,
      minRating: 4.0,
      requiredDocuments: ["ID Card", "Professional Certificate", "Insurance"],
      trialPeriod: 30,
      backgroundCheck: true,
    },
    rating: {
      minRating: 1.0,
      maxRating: 5.0,
      suspensionThreshold: 2.5,
      probationThreshold: 3.5,
      reviewPeriod: 30,
    },
    availability: {
      responseTimeout: 30,
      workingHours: {
        start: "08:00",
        end: "18:00",
      },
      maxSimultaneousJobs: 3,
      restBetweenJobs: 15,
    },
    commission: {
      standardRate: 15,
      premiumRate: 12,
      newProviderRate: 10,
      bonusSystem: true,
    },
    notifications: {
      newRequestAlert: true,
      ratingAlert: true,
      paymentAlert: true,
      systemUpdates: false,
    },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ status: "success" | "error" | "pending"; message: string } | null>(
    null,
  )
  const [stats] = useState({
    activeProviders: 247,
    pendingApproval: 23,
    suspended: 8,
    avgRating: 4.2,
    avgResponseTime: 18,
    satisfactionRate: 92,
  })

  // Modal states
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newDocument, setNewDocument] = useState("")

  // Event handlers
  const handleSettingChange = (section: keyof ProviderSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const handleNestedSettingChange = (section: keyof ProviderSettings, nestedKey: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...(prev[section] as any)[nestedKey],
          [key]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    showNotification("Sauvegarde des paramètres prestataires...", "info")

    try {
      const response = await fetch("/api/settings/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        showNotification("Paramètres prestataires sauvegardés avec succès", "success")
      } else {
        throw new Error("Erreur de sauvegarde")
      }
    } catch (error) {
      showNotification("Erreur lors de la sauvegarde", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setTestResult({ status: "pending", message: "Test des règles de validation..." })

    try {
      const response = await fetch("/api/settings/providers/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult({
          status: "success",
          message: "✅ Toutes les règles de validation fonctionnent correctement",
        })
      } else {
        throw new Error("Test failed")
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: "❌ Erreur dans la configuration des seuils de notation",
      })
    }
  }

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
      setSettings({
        validation: {
          autoApproval: false,
          minRating: 4.0,
          requiredDocuments: ["ID Card", "Professional Certificate", "Insurance"],
          trialPeriod: 30,
          backgroundCheck: true,
        },
        rating: {
          minRating: 1.0,
          maxRating: 5.0,
          suspensionThreshold: 2.5,
          probationThreshold: 3.5,
          reviewPeriod: 30,
        },
        availability: {
          responseTimeout: 30,
          workingHours: {
            start: "08:00",
            end: "18:00",
          },
          maxSimultaneousJobs: 3,
          restBetweenJobs: 15,
        },
        commission: {
          standardRate: 15,
          premiumRate: 12,
          newProviderRate: 10,
          bonusSystem: true,
        },
        notifications: {
          newRequestAlert: true,
          ratingAlert: true,
          paymentAlert: true,
          systemUpdates: false,
        },
      })
      showNotification("Paramètres réinitialisés aux valeurs par défaut", "success")
    }
  }

  const handleExportConfig = () => {
    const configData = JSON.stringify(settings, null, 2)
    const blob = new Blob([configData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `provider-settings-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification("Configuration exportée avec succès", "success")
    setShowExportModal(false)
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          showNotification("Configuration importée avec succès", "success")
          setShowImportModal(false)
        } catch (error) {
          showNotification("Erreur lors de l'importation du fichier", "error")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setSettings((prev) => ({
        ...prev,
        validation: {
          ...prev.validation,
          requiredDocuments: [...prev.validation.requiredDocuments, newDocument.trim()],
        },
      }))
      setNewDocument("")
      showNotification("Document ajouté à la liste", "success")
    }
  }

  const handleRemoveDocument = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        requiredDocuments: prev.validation.requiredDocuments.filter((_, i) => i !== index),
      },
    }))
    showNotification("Document supprimé de la liste", "success")
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

      <MainContent>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <PageHeader>
              <Breadcrumb>
                <Link href="/">Dashboard</Link>
                <ChevronRight size={12} />
                <Link href="/settings">Paramètres</Link>
                <ChevronRight size={12} />
                <span>Gestion Prestataires</span>
              </Breadcrumb>

              <PageTitle>Gestion des Prestataires</PageTitle>
              <PageSubtitle>Configuration de la validation, notation et gestion des prestataires</PageSubtitle>
            </PageHeader>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.activeProviders}</StatValue>
                <StatLabel>Prestataires Actifs</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.pendingApproval}</StatValue>
                <StatLabel>En Attente d'Approbation</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.suspended}</StatValue>
                <StatLabel>Suspendus</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.avgRating}/5</StatValue>
                <StatLabel>Note Moyenne</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.avgResponseTime}min</StatValue>
                <StatLabel>Temps de Réponse Moyen</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.satisfactionRate}%</StatValue>
                <StatLabel>Taux de Satisfaction</StatLabel>
              </StatCard>
            </StatsGrid>
          </motion.div>

          {/* Validation Settings */}
          <motion.div variants={itemVariants}>
            <ConfigSection>
              <SectionHeader>
                <SectionTitle>
                  <Shield />
                  Validation et Approbation
                </SectionTitle>
                <StatusBadge status={settings.validation.autoApproval ? "active" : "paused"}>
                  <CheckCircle />
                  {settings.validation.autoApproval ? "Auto-approbation" : "Validation manuelle"}
                </StatusBadge>
              </SectionHeader>

              <ConfigGrid>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Settings />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Configuration Générale</h3>
                      <p>Paramètres de base pour la validation</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <SwitchGroup>
                      <Label>Approbation automatique</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.validation.autoApproval}
                          onChange={(e) => handleSettingChange("validation", "autoApproval", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>

                    <FormGroup>
                      <Label>Note minimale requise</Label>
                      <Slider
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={settings.validation.minRating}
                        onChange={(e) =>
                          handleSettingChange("validation", "minRating", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.validation.minRating}/5</SliderValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Période d'essai (jours)</Label>
                      <Input
                        type="number"
                        value={settings.validation.trialPeriod}
                        onChange={(e) =>
                          handleSettingChange("validation", "trialPeriod", Number.parseInt(e.target.value))
                        }
                      />
                    </FormGroup>

                    <SwitchGroup>
                      <Label>Vérification antécédents</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.validation.backgroundCheck}
                          onChange={(e) => handleSettingChange("validation", "backgroundCheck", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Award />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Documents Requis</h3>
                      <p>Documents obligatoires pour l'inscription</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <DocumentList>
                      {settings.validation.requiredDocuments.map((doc, index) => (
                        <DocumentItem key={index}>
                          <DocumentName>{doc}</DocumentName>
                          <RemoveDocBtn onClick={() => handleRemoveDocument(index)}>
                            <Trash2 />
                          </RemoveDocBtn>
                        </DocumentItem>
                      ))}
                    </DocumentList>

                    <AddDocumentForm>
                      <Input
                        type="text"
                        placeholder="Nouveau document requis"
                        value={newDocument}
                        onChange={(e) => setNewDocument(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddDocument()}
                      />
                      <Button onClick={handleAddDocument}>
                        <Plus />
                      </Button>
                    </AddDocumentForm>
                  </ConfigContent>

                  <Button onClick={() => setShowDocumentModal(true)}>
                    <FileText />
                    Gérer les documents
                  </Button>
                </ConfigCard>
              </ConfigGrid>
            </ConfigSection>
          </motion.div>

          {/* Rating System */}
          <motion.div variants={itemVariants}>
            <ConfigSection>
              <SectionHeader>
                <SectionTitle>
                  <Star />
                  Système de Notation
                </SectionTitle>
                <StatusBadge status="active">
                  <TrendingUp />
                  Système actif
                </StatusBadge>
              </SectionHeader>

              <ConfigGrid>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Star />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Seuils de Notation</h3>
                      <p>Seuils pour les actions automatiques</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <FormGroup>
                      <Label>Seuil de suspension ({settings.rating.suspensionThreshold}/5)</Label>
                      <Slider
                        type="range"
                        min="1"
                        max="4"
                        step="0.1"
                        value={settings.rating.suspensionThreshold}
                        onChange={(e) =>
                          handleSettingChange("rating", "suspensionThreshold", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.rating.suspensionThreshold}/5</SliderValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Seuil de mise à l'épreuve ({settings.rating.probationThreshold}/5)</Label>
                      <Slider
                        type="range"
                        min="2"
                        max="4.5"
                        step="0.1"
                        value={settings.rating.probationThreshold}
                        onChange={(e) =>
                          handleSettingChange("rating", "probationThreshold", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.rating.probationThreshold}/5</SliderValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Période de révision (jours)</Label>
                      <Input
                        type="number"
                        value={settings.rating.reviewPeriod}
                        onChange={(e) => handleSettingChange("rating", "reviewPeriod", Number.parseInt(e.target.value))}
                      />
                    </FormGroup>
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Activity />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Actions Automatiques</h3>
                      <p>Actions basées sur les seuils</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ValidationRules>
                    <RuleItem>
                      <RuleLabel>Note ≤ {settings.rating.suspensionThreshold}</RuleLabel>
                      <RuleValue>🚫 Suspension automatique</RuleValue>
                    </RuleItem>
                    <RuleItem>
                      <RuleLabel>Note ≤ {settings.rating.probationThreshold}</RuleLabel>
                      <RuleValue>⚠️ Mise à l'épreuve</RuleValue>
                    </RuleItem>
                    <RuleItem>
                      <RuleLabel>Note ≥ 4.5</RuleLabel>
                      <RuleValue>⭐ Statut premium</RuleValue>
                    </RuleItem>
                    <RuleItem>
                      <RuleLabel>Révision tous les {settings.rating.reviewPeriod} jours</RuleLabel>
                      <RuleValue>🔄 Réévaluation auto</RuleValue>
                    </RuleItem>
                  </ValidationRules>
                </ConfigCard>
              </ConfigGrid>
            </ConfigSection>
          </motion.div>

          {/* Availability Settings */}
          <motion.div variants={itemVariants}>
            <ConfigSection>
              <SectionHeader>
                <SectionTitle>
                  <Clock />
                  Disponibilité et Planning
                </SectionTitle>
                <StatusBadge status="active">
                  <Timer />
                  Gestion active
                </StatusBadge>
              </SectionHeader>

              <ConfigGrid>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Timer />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Temps de Réponse</h3>
                      <p>Délais et timeouts</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <FormGroup>
                      <Label>Timeout réponse (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.availability.responseTimeout}
                        onChange={(e) =>
                          handleSettingChange("availability", "responseTimeout", Number.parseInt(e.target.value))
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Repos entre interventions (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.availability.restBetweenJobs}
                        onChange={(e) =>
                          handleSettingChange("availability", "restBetweenJobs", Number.parseInt(e.target.value))
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Max interventions simultanées</Label>
                      <Input
                        type="number"
                        value={settings.availability.maxSimultaneousJobs}
                        onChange={(e) =>
                          handleSettingChange("availability", "maxSimultaneousJobs", Number.parseInt(e.target.value))
                        }
                      />
                    </FormGroup>
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Calendar />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Heures de Travail</h3>
                      <p>Horaires standard de service</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <FormGroup>
                      <Label>Heure de début</Label>
                      <Input
                        type="time"
                        value={settings.availability.workingHours.start}
                        onChange={(e) =>
                          handleNestedSettingChange("availability", "workingHours", "start", e.target.value)
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Heure de fin</Label>
                      <Input
                        type="time"
                        value={settings.availability.workingHours.end}
                        onChange={(e) =>
                          handleNestedSettingChange("availability", "workingHours", "end", e.target.value)
                        }
                      />
                    </FormGroup>

                    <ValidationRules>
                      <RuleItem>
                        <RuleLabel>Horaires standards</RuleLabel>
                        <RuleValue>
                          {settings.availability.workingHours.start} - {settings.availability.workingHours.end}
                        </RuleValue>
                      </RuleItem>
                      <RuleItem>
                        <RuleLabel>Urgences 24h/7j</RuleLabel>
                        <RuleValue>✅ Disponible</RuleValue>
                      </RuleItem>
                    </ValidationRules>
                  </ConfigContent>
                </ConfigCard>
              </ConfigGrid>
            </ConfigSection>
          </motion.div>

          {/* Commission Settings */}
          <motion.div variants={itemVariants}>
            <ConfigSection>
              <SectionHeader>
                <SectionTitle>
                  <DollarSign />
                  Système de Commission
                </SectionTitle>
                <StatusBadge status={settings.commission.bonusSystem ? "active" : "paused"}>
                  <TrendingUp />
                  {settings.commission.bonusSystem ? "Bonus actifs" : "Bonus désactivés"}
                </StatusBadge>
              </SectionHeader>

              <ConfigGrid>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <DollarSign />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Taux de Commission</h3>
                      <p>Pourcentages par catégorie</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <FormGroup>
                      <Label>Taux standard ({settings.commission.standardRate}%)</Label>
                      <Slider
                        type="range"
                        min="5"
                        max="25"
                        step="0.5"
                        value={settings.commission.standardRate}
                        onChange={(e) =>
                          handleSettingChange("commission", "standardRate", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.commission.standardRate}%</SliderValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Taux premium ({settings.commission.premiumRate}%)</Label>
                      <Slider
                        type="range"
                        min="5"
                        max="20"
                        step="0.5"
                        value={settings.commission.premiumRate}
                        onChange={(e) =>
                          handleSettingChange("commission", "premiumRate", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.commission.premiumRate}%</SliderValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Taux nouveaux prestataires ({settings.commission.newProviderRate}%)</Label>
                      <Slider
                        type="range"
                        min="5"
                        max="15"
                        step="0.5"
                        value={settings.commission.newProviderRate}
                        onChange={(e) =>
                          handleSettingChange("commission", "newProviderRate", Number.parseFloat(e.target.value))
                        }
                      />
                      <SliderValue>{settings.commission.newProviderRate}%</SliderValue>
                    </FormGroup>
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Award />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Système de Bonus</h3>
                      <p>Incitations et récompenses</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <SwitchGroup>
                      <Label>Système de bonus</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.commission.bonusSystem}
                          onChange={(e) => handleSettingChange("commission", "bonusSystem", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>

                    <ValidationRules>
                      <RuleItem>
                        <RuleLabel>Note ≥ 4.8</RuleLabel>
                        <RuleValue>-2% commission</RuleValue>
                      </RuleItem>
                      <RuleItem>
                        <RuleLabel>100+ interventions/mois</RuleLabel>
                        <RuleValue>-1% commission</RuleValue>
                      </RuleItem>
                      <RuleItem>
                        <RuleLabel>Temps de réponse &lt; 10 minutes</RuleLabel>
                        <RuleValue>Bonus 500 XAF</RuleValue>
                      </RuleItem>
                      <RuleItem>
                        <RuleLabel>Taux de satisfaction &gt; 95%</RuleLabel>
                        <RuleValue>Bonus mensuel</RuleValue>
                      </RuleItem>
                    </ValidationRules>
                  </ConfigContent>
                </ConfigCard>
              </ConfigGrid>
            </ConfigSection>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={itemVariants}>
            <ConfigSection>
              <SectionHeader>
                <SectionTitle>
                  <Bell />
                  Notifications Prestataires
                </SectionTitle>
                <StatusBadge status="active">
                  <Bell />
                  Notifications actives
                </StatusBadge>
              </SectionHeader>

              <ConfigGrid>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Bell />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Types de Notifications</h3>
                      <p>Configuration des alertes</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <ConfigContent>
                    <SwitchGroup>
                      <Label>Alertes nouvelles demandes</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.notifications.newRequestAlert}
                          onChange={(e) => handleSettingChange("notifications", "newRequestAlert", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>

                    <SwitchGroup>
                      <Label>Alertes notation</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.notifications.ratingAlert}
                          onChange={(e) => handleSettingChange("notifications", "ratingAlert", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>

                    <SwitchGroup>
                      <Label>Alertes paiement</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.notifications.paymentAlert}
                          onChange={(e) => handleSettingChange("notifications", "paymentAlert", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>

                    <SwitchGroup>
                      <Label>Mises à jour système</Label>
                      <Switch>
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemUpdates}
                          onChange={(e) => handleSettingChange("notifications", "systemUpdates", e.target.checked)}
                        />
                        <span></span>
                      </Switch>
                    </SwitchGroup>
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigIcon>
                      <Zap />
                    </ConfigIcon>
                    <ConfigInfo>
                      <h3>Test Configuration</h3>
                      <p>Vérifier les paramètres</p>
                    </ConfigInfo>
                  </ConfigHeader>

                  <TestSection>
                    <TestHeader>
                      <span>Test des règles de validation</span>
                      <Button variant="secondary" onClick={handleTest}>
                        <TestTube />
                        Tester
                      </Button>
                    </TestHeader>

                    {testResult && (
                      <TestResult status={testResult.status}>
                        {testResult.status === "pending" && <RefreshCw className="animate-spin" />}
                        {testResult.status === "success" && <CheckCircle />}
                        {testResult.status === "error" && <XCircle />}
                        {testResult.message}
                      </TestResult>
                    )}
                  </TestSection>
                </ConfigCard>
              </ConfigGrid>
            </ConfigSection>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants}>
            <ActionButtons>
              <Button onClick={() => setShowExportModal(true)}>
                <Download />
                Exporter Config
              </Button>
              <Button onClick={() => setShowImportModal(true)}>
                <Upload />
                Importer Config
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                <RefreshCw />
                Réinitialiser
              </Button>
              <Button onClick={handleTest}>
                <TestTube />
                Tester Configuration
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </ActionButtons>
          </motion.div>
        </motion.div>
      </MainContent>

      {/* Export Modal */}
      {showExportModal && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowExportModal(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <Download />
                Exporter la Configuration
              </ModalTitle>
              <CloseBtn onClick={() => setShowExportModal(false)}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Télécharger la configuration actuelle des paramètres prestataires au format JSON.
              </p>
              <ValidationRules>
                <RuleItem>
                  <RuleLabel>Format</RuleLabel>
                  <RuleValue>JSON</RuleValue>
                </RuleItem>
                <RuleItem>
                  <RuleLabel>Taille estimée</RuleLabel>
                  <RuleValue>~2 KB</RuleValue>
                </RuleItem>
                <RuleItem>
                  <RuleLabel>Contenu</RuleLabel>
                  <RuleValue>Tous les paramètres</RuleValue>
                </RuleItem>
              </ValidationRules>
            </div>

            <ActionButtons>
              <Button onClick={() => setShowExportModal(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleExportConfig}>
                <Download />
                Télécharger
              </Button>
            </ActionButtons>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowImportModal(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <Upload />
                Importer une Configuration
              </ModalTitle>
              <CloseBtn onClick={() => setShowImportModal(false)}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Sélectionnez un fichier JSON de configuration à importer.
              </p>

              <div
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  style={{ display: "none" }}
                  id="config-import"
                />
                <label
                  htmlFor="config-import"
                  style={{
                    cursor: "pointer",
                    color: "var(--neon-blue)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Upload size={32} />
                  Cliquez pour sélectionner un fichier
                </label>
              </div>

              <div
                style={{
                  background: "rgba(255, 193, 7, 0.1)",
                  border: "1px solid rgba(255, 193, 7, 0.3)",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "#ffc107",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ L'importation remplacera tous les paramètres actuels.
              </div>
            </div>

            <ActionButtons>
              <Button onClick={() => setShowImportModal(false)}>Annuler</Button>
            </ActionButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  )
}
