"use client"

import { useState } from "react"
import { X, Phone, MessageCircle, Mail, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"
import { useNotificationStore } from "@/store/use-notification-store"
import { RequestsService } from "@/lib/services/requests-service"

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 600px;
  position: relative;
`

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
`

const CloseButton = styled.button`
  background: none;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ModalBody = styled.div`
  padding: 2rem;
`

const ProviderInfo = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ProviderAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
`

const ProviderDetails = styled.div`
  flex: 1;
`

const ProviderName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
`

const ProviderMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`

const ContactMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const ContactMethod = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const ContactIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const ContactLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`

const ContactValue = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
`

const MessageSection = styled.div`
  margin-top: 2rem;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const ModalFooter = styled.div`
  padding: 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})<{ variant?: string }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `
      default:
        return `
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          &:hover:not(:disabled) {
            background: var(--glass-bg);
          }
        `
    }
  }}
`

interface ContactProviderModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  provider: {
    id: string
    name: string
    phone: string
    whatsapp?: string
    email: string
    rating?: number
    services?: string[]
  }
}

export function ContactProviderModal({ 
  isOpen, 
  onClose, 
  requestId, 
  provider 
}: ContactProviderModalProps) {
  const { addNotification } = useNotificationStore()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const getProviderAvatar = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatPhoneNumber = (phone: string) => {
    // Clean phone number for links
    return phone.replace(/[^0-9+]/g, "")
  }

  const handleCall = () => {
    const cleanPhone = formatPhoneNumber(provider.phone)
    window.open(`tel:${cleanPhone}`, "_self")
    addNotification({
      id: Date.now().toString(),
      message: `Appel vers ${provider.name}`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleWhatsApp = () => {
    const cleanPhone = formatPhoneNumber(provider.whatsapp || provider.phone)
    const whatsappMessage = encodeURIComponent(
      `Bonjour ${provider.name}, concernant la demande #${requestId}. Pouvez-vous me confirmer votre disponibilité ?`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${whatsappMessage}`, "_blank")
    addNotification({
      id: Date.now().toString(),
      message: `Message WhatsApp envoyé à ${provider.name}`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Demande de service #${requestId}`)
    const body = encodeURIComponent(
      `Bonjour ${provider.name},\n\nJ'aimerais discuter avec vous concernant la demande de service #${requestId}.\n\nPouvez-vous me confirmer votre disponibilité ?\n\nCordialement`
    )
    window.open(`mailto:${provider.email}?subject=${subject}&body=${body}`, "_self")
    addNotification({
      id: Date.now().toString(),
      message: `Email ouvert pour ${provider.name}`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      addNotification({
        id: Date.now().toString(),
        message: "Veuillez saisir un message",
        type: "warning",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    setLoading(true)
    try {
      await RequestsService.contactProvider(requestId, message.trim())

      addNotification({
        id: Date.now().toString(),
        message: `Message envoyé à ${provider.name}`,
        type: "success",
        timestamp: new Date(),
        read: false,
      })
      
      setMessage("")
      onClose()
    } catch (error) {
      console.error("Error sending message:", error)
      addNotification({
        id: Date.now().toString(),
        message: error instanceof Error ? error.message : "Erreur lors de l'envoi du message",
        type: "error",
        timestamp: new Date(),
        read: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMessage("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
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
            <ModalTitle>Contacter le prestataire</ModalTitle>
            <CloseButton onClick={handleClose} disabled={loading}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <ProviderInfo>
              <ProviderAvatar>
                {getProviderAvatar(provider.name)}
              </ProviderAvatar>
              <ProviderDetails>
                <ProviderName>{provider.name}</ProviderName>
                <ProviderMeta>
                  {provider.rating && (
                    <span>⭐ {provider.rating}/5</span>
                  )}
                  {provider.services && (
                    <span>{provider.services.slice(0, 2).join(", ")}</span>
                  )}
                </ProviderMeta>
              </ProviderDetails>
            </ProviderInfo>

            <ContactMethods>
              <ContactMethod onClick={handleCall} disabled={loading}>
                <ContactIcon>
                  <Phone size={20} />
                </ContactIcon>
                <ContactLabel>Appeler</ContactLabel>
                <ContactValue>{provider.phone}</ContactValue>
              </ContactMethod>

              <ContactMethod onClick={handleWhatsApp} disabled={loading}>
                <ContactIcon>
                  <MessageCircle size={20} />
                </ContactIcon>
                <ContactLabel>WhatsApp</ContactLabel>
                <ContactValue>{provider.whatsapp || provider.phone}</ContactValue>
              </ContactMethod>

              <ContactMethod onClick={handleEmail} disabled={loading}>
                <ContactIcon>
                  <Mail size={20} />
                </ContactIcon>
                <ContactLabel>Email</ContactLabel>
                <ContactValue>{provider.email}</ContactValue>
              </ContactMethod>
            </ContactMethods>

            <MessageSection>
              <FormGroup>
                <Label htmlFor="message">Envoyer un message interne</Label>
                <TextArea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Écrivez votre message à ${provider.name}...\n\nExemple: "Bonjour, pouvez-vous confirmer votre disponibilité pour la demande #${requestId} ?"`}
                  disabled={loading}
                />
              </FormGroup>
            </MessageSection>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClose} disabled={loading}>
              Fermer
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendMessage} 
              disabled={loading || !message.trim()}
            >
              <Send size={16} />
              {loading ? "Envoi..." : "Envoyer le message"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  )
}