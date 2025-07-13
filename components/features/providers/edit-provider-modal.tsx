"use client"

import type React from "react"

import styled from "styled-components"
import { X, User, Phone, Mail, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore } from "@/store/use-notification-store"
import { useProvidersData } from "@/hooks/use-providers-data"

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

interface EditProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string | null
}

export function EditProviderModal({ isOpen, onClose, providerId }: EditProviderModalProps) {
  const { addNotification } = useNotificationStore()
  const { data: providers } = useProvidersData()

  const provider = providers?.find((p) => p.id === providerId)

  const [formData, setFormData] = useState({
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
  }, [provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/providers/${providerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "success",
          title: "Prestataire modifié",
          message: `${formData.name} a été modifié avec succès`,
          timestamp: new Date(),
          read: false,
        })

        onClose()
      } else {
        throw new Error("Erreur lors de la modification")
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible de modifier le prestataire",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!provider) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Modifier le Prestataire</ModalTitle>
              <CloseBtn onClick={onClose}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <FormLabel>
                    <User />
                    Nom complet
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Nom et prénom"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    <Phone />
                    Numéro de téléphone
                  </FormLabel>
                  <FormInput
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
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
                    required
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
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel>
                    <Briefcase />
                    Spécialités (séparées par des virgules)
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Plomberie, Électricité, Réparation..."
                    value={formData.services}
                    onChange={(e) => handleChange("services", e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel>
                    <MapPin />
                    Zones de couverture (séparées par des virgules)
                  </FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Bonamoussadi Centre, Bonamoussadi Nord..."
                    value={formData.coverage}
                    onChange={(e) => handleChange("coverage", e.target.value)}
                    required
                  />
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
                  />
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
                  />
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
                  />
                </FormGroup>
              </FormGrid>

              <FormActions>
                <Button type="button" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Sauvegarder les modifications
                </Button>
              </FormActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  )
}
