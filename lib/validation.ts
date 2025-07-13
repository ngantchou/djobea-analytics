"use client"

import { z } from "zod"
import { ValidationError } from "./error-handler"

// Common validation schemas
export const emailSchema = z.string().email("Adresse email invalide")
export const phoneSchema = z.string().regex(/^[+]?[0-9\s-()]+$/, "Numéro de téléphone invalide")
export const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")

// Provider validation
export const providerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: emailSchema,
  phone: phoneSchema,
  services: z.array(z.string()).min(1, "Au moins un service doit être sélectionné"),
  location: z.string().min(2, "La localisation est requise"),
  experience: z.number().min(0, "L'expérience ne peut pas être négative"),
  rating: z.number().min(0).max(5, "La note doit être entre 0 et 5"),
})

// Request validation
export const requestSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  serviceType: z.string().min(1, "Le type de service est requis"),
  location: z.string().min(2, "La localisation est requise"),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priorité invalide" }),
  }),
  budget: z.number().min(0, "Le budget ne peut pas être négatif"),
})

// Settings validation
export const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  preferences: z.object({
    language: z.enum(["fr", "en"]),
    timezone: z.string(),
    currency: z.enum(["XAF", "EUR", "USD"]),
  }),
})

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      throw new ValidationError("Données invalides", {
        errors: error.errors,
        messages: errorMessages,
      })
    }
    throw error
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
}

// HTML sanitization for rich text
export function sanitizeHtml(html: string): string {
  const allowedTags = ["p", "br", "strong", "em", "u", "ol", "ul", "li", "h1", "h2", "h3", "h4", "h5", "h6"]
  const allowedAttributes = ["class", "id"]

  // This is a basic implementation - in production, use a library like DOMPurify
  let sanitized = html

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, "")
  sanitized = sanitized.replace(/javascript:/gi, "")

  return sanitized
}

// File validation
export function validateFile(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  },
): void {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

  if (file.size > maxSize) {
    throw new ValidationError(`Le fichier est trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`)
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new ValidationError(`Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(", ")}`)
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new ValidationError(
        `Extension de fichier non autorisée. Extensions autorisées: ${allowedExtensions.join(", ")}`,
      )
    }
  }
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.startsWith("237")) {
    // Cameroon format
    return `+237 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`
  }

  return phone
}

// Currency formatting
export function formatCurrency(amount: number, currency = "XAF"): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount)
}
