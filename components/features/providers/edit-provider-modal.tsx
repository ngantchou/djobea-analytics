"use client"

import type React from "react"

import styled from "styled-components"
import { X, User, Phone, Mail, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore } from "@/store/use-notification-store"
import { useProvidersData } from "@/hooks/use-providers-data"
import { providersService } from "@/lib/services/providers-service"
import type { CreateProviderData } from "@/lib/services/providers-service"

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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const FormGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${(props) => props.fullWidth && "grid-column: 1 / -1;"}
`

const FormLabel = styled.label`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const FormInput = styled.input`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const FormTextarea = styled.textarea`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: string }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  disabled: cursor: not-allowed;
  opacity: ${props => props.disabled ? 0.6 : 1};

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
        `
      default:
        return `
          background: var(--glass-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `
    }
  }}

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

interface EditProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string | null
}

export function EditProviderModal({ isOpen, onClose, providerId }: EditProviderModalProps) {
  const { addNotification } = useNotificationStore()
  const { data: providers, mutate } = useProvidersData()

  const provider = providers?.data?.find((p) => p.id === providerId)

  const [formData, setFormData] = useState<CreateProviderData>({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    services: "",
    coverage: "",
    rate: "",
    experience: "",
    description: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<CreateProviderData>>({})

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || "",
        phone: provider.phone || "",
        whatsapp: provider.whatsapp || "",
        email: provider.email || "",
        services: provider.services?.join(", ") || "",
        coverage: provider.coverageAreas?.join(", ") || "",
        rate: provider.hourlyRate?.toString() || "",
        experience: provider.experience?.toString() || "",
        description: provider.description || "",
      })
    }
    // Clear errors when modal opens
    setErrors({})
  }, [provider])

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProviderData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis"
    }

    if (!formData.services.trim()) {
      newErrors.services = "Les services sont requis"
    }

    if (!formData.coverage.trim()) {
      newErrors.coverage = "Les zones de couverture sont requises"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (formData.rate && (isNaN(Number(formData.rate)) || Number(formData.rate) < 0)) {
      newErrors.rate = "Le tarif doit être un nombre positif"
    }

    if (formData.experience && (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)) {
      newErrors.experience = "L'expérience doit être un nombre positif"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!providerId) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "ID du prestataire manquant",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    if (!validateForm()) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur de validation",
        message: "Veuillez corriger les erreurs dans le formulaire",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    setIsLoading(true)

    try {
      await providersService.updateProvider(providerId, formData)

      addNotification({
        id: Date.now().toString(),
        type: "success",
        title: "Prestataire modifié",
        message: `${formData.name} a été modifié avec succès`,
        timestamp: new Date(),
        read: false,
      })

      // Refresh the providers data
      mutate()

      onClose()
    } catch (error) {
      console.error("Error updating provider:", error)
      
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: error instanceof Error ? error.message : "Impossible de modifier le prestataire",
        timestamp: new Date(),
        read: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateProviderData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!provider) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={handleClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Modifier le Prestataire</ModalTitle>
              <CloseBtn onClick={handleClose} disabled={isLoading}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <FormLabel>
                    <User />
                    Nom complet *
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Nom et prénom"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.name ? '#ef4444' : undefined }}
                    required
                  />
                  {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.name}</span>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Phone />
                    Numéro de téléphone *
                  </FormLabel>
                  <FormInput
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.phone ? '#ef4444' : undefined }}
                    required
                  />
                  {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.phone}</span>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Phone />
                    WhatsApp ID
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="ID WhatsApp"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    disabled={isLoading}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Mail />
                    Email
                  </FormLabel>
                  <FormInput
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                  />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email}</span>}
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel>
                    <Briefcase />
                    Spécialités (séparées par des virgules) *
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Plomberie, Électricité, Réparation..."
                    value={formData.services}
                    onChange={(e) => handleChange("services", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.services ? '#ef4444' : undefined }}
                    required
                  />
                  {errors.services && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.services}</span>}
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel>
                    <MapPin />
                    Zones de couverture (séparées par des virgules) *
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Bonamoussadi Centre, Bonamoussadi Nord..."
                    value={formData.coverage}
                    onChange={(e) => handleChange("coverage", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.coverage ? '#ef4444' : undefined }}
                    required
                  />
                  {errors.coverage && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.coverage}</span>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <DollarSign />
                    Tarif horaire (FCFA)
                  </FormLabel>
                  <FormInput
                    type="number"
                    placeholder="2500"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleChange("rate", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.rate ? '#ef4444' : undefined }}
                  />
                  {errors.rate && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.rate}</span>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Calendar />
                    Expérience (années)
                  </FormLabel>
                  <FormInput
                    type="number"
                    placeholder="5"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    disabled={isLoading}
                    style={{ borderColor: errors.experience ? '#ef4444' : undefined }}
                  />
                  {errors.experience && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.experience}</span>}
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel>
                    <Briefcase />
                    Description
                  </FormLabel>
                  <FormTextarea
                    placeholder="Décrivez brièvement le prestataire et ses compétences..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    disabled={isLoading}
                  />
                </FormGroup>
              </FormGrid>

              <FormActions>
                <Button type="button" onClick={handleClose} disabled={isLoading}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder les modifications"
                  )}
                </Button>
              </FormActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  )
}