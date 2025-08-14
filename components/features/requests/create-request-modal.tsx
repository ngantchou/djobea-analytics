"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Phone, User, Wrench, Calendar, DollarSign, AlertTriangle, Clock, Plus } from "lucide-react"
import { z } from "zod"
import React from "react"

const createRequestSchema = z.object({
  // Informations client
  clientName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  clientPhone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  clientEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  
  // Service demandé
  serviceType: z.string().min(1, "Veuillez sélectionner un type de service"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  
  // Localisation
  location: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  zone: z.string().min(1, "Veuillez sélectionner une zone"),
  accessInstructions: z.string().optional(),
  
  // Priorité et planification
  priority: z.enum(["low", "normal", "high", "urgent"]),
  schedulingPreference: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  
  // Budget estimé
  estimatedBudget: z.number().min(0, "Le budget doit être positif").optional(),
  
  // Notes
  notes: z.string().optional(),
})

type CreateRequestForm = z.infer<typeof createRequestSchema>

interface CreateRequestModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateRequestForm) => Promise<void>
  availableServices?: string[]
  availableZones?: string[]
  loading?: boolean
}

const DEFAULT_SERVICES = [
  "Électricité",
  "Plomberie", 
  "Ménage",
  "Jardinage",
  "Électroménager",
  "Climatisation",
  "Peinture",
  "Maçonnerie",
  "Menuiserie",
  "Informatique",
  "Mécanique",
  "Livraison"
]

const DEFAULT_ZONES = [
  "Bonamoussadi",
  "Akwa",
  "Deido",
  "Bonapriso",
  "Bali",
  "Makepe",
  "Ndogpassi",
  "PK8",
  "Logpom",
  "Bassa",
  "Kotto"
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Faible", description: "Non urgent, flexible sur les délais", color: "bg-green-100 text-green-800" },
  { value: "normal", label: "Normale", description: "Délai standard, dans la semaine", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "Élevée", description: "Important, dans les 2-3 jours", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", description: "Très important, dans la journée", color: "bg-red-100 text-red-800" },
]

const SCHEDULING_OPTIONS = [
  { value: "flexible", label: "Flexible", description: "Aucune contrainte de temps" },
  { value: "morning", label: "Matin", description: "Entre 8h et 12h" },
  { value: "afternoon", label: "Après-midi", description: "Entre 12h et 17h" },
  { value: "evening", label: "Soir", description: "Entre 17h et 20h" },
  { value: "weekend", label: "Week-end", description: "Samedi ou dimanche" },
  { value: "specific", label: "Date précise", description: "Date et heure spécifiques" },
]

export function CreateRequestModal({
  open,
  onClose,
  onSubmit,
  availableServices = DEFAULT_SERVICES,
  availableZones = DEFAULT_ZONES,
  loading = false
}: CreateRequestModalProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const form = useForm<CreateRequestForm>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      serviceType: "",
      description: "",
      location: "",
      zone: "",
      accessInstructions: "",
      priority: "normal",
      schedulingPreference: "flexible",
      preferredDate: "",
      preferredTime: "",
      estimatedBudget: undefined,
      notes: "",
    },
  })

  const selectedPriority = form.watch("priority")
  const selectedScheduling = form.watch("schedulingPreference")
  const showDateTimeFields = selectedScheduling === "specific"

  const handleSubmit = async (data: CreateRequestForm) => {
    try {
      await onSubmit(data)
      form.reset()
      setCurrentStep(1)
      onClose()
      toast({
        title: "Demande créée",
        description: "La demande a été créée avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getFieldsForStep = (step: number): (keyof CreateRequestForm)[] => {
    switch (step) {
      case 1:
        return ["clientName", "clientPhone", "clientEmail"]
      case 2:
        return ["serviceType", "description"]
      case 3:
        return ["location", "zone"]
      case 4:
        return ["priority"]
      default:
        return []
    }
  }

  const handleClose = () => {
    form.reset()
    setCurrentStep(1)
    onClose()
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`w-8 h-0.5 transition-colors ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Informations client</h3>
            </div>
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: +237 6XX XXX XXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: jean.dupont@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Service demandé</h3>
            </div>
            
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de service *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableServices.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description détaillée *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le problème ou le service demandé en détail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Localisation</h3>
            </div>
            
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableZones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Rue 123, Quartier XYZ, près de la pharmacie..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accessInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions d'accès (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Portail bleu, 2ème étage, porte droite..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Priorité et planification</h3>
            </div>
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau de priorité *</FormLabel>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {PRIORITY_OPTIONS.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all border-2 ${
                          field.value === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => field.onChange(option.value)}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <FormField
              control={form.control}
              name="schedulingPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Préférence horaire</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une préférence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCHEDULING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showDateTimeFields && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date souhaitée</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure souhaitée</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Separator />
            
            <FormField
              control={form.control}
              name="estimatedBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget estimé (optionnel)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        placeholder="5000"
                        className="pl-10"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes supplémentaires</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires, contraintes particulières..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Créer une nouvelle demande
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations nécessaires pour créer une demande de service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderStepIndicator()}
            
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            <Separator />
            
            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Précédent
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Annuler
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext}>
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer la demande
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}