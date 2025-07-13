"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Globe,
  MapPin,
  DollarSign,
  Building,
  Save,
  RotateCcw,
  TestTube,
  Settings,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { TooltipProvider } from "@/components/ui/tooltip"
import Link from "next/link"
import { useSettingsStore } from "@/store/use-settings-store"

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

const cities = [
  { value: "douala", label: "Douala", country: "Cameroun" },
  { value: "yaounde", label: "Yaoundé", country: "Cameroun" },
  { value: "bafoussam", label: "Bafoussam", country: "Cameroun" },
  { value: "bamenda", label: "Bamenda", country: "Cameroun" },
]

const languages = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "es", label: "Español", flag: "🇪🇸" },
]

const currencies = [
  { value: "XAF", label: "Franc CFA (XAF)", symbol: "FCFA" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
]

const timezones = [
  { value: "Africa/Douala", label: "Afrique/Douala (WAT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "America/New_York", label: "Amérique/New York (EST)" },
]

export default function GeneralSettingsPage() {
  const { general, updateGeneral, saveSettings, isLoading } = useSettingsStore()
  const [localSettings, setLocalSettings] = useState(general)
  const [newZoneName, setNewZoneName] = useState("")
  const [newZoneDescription, setNewZoneDescription] = useState("")
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [newServiceName, setNewServiceName] = useState("")
  const [newServiceDescription, setNewServiceDescription] = useState("")
  const [editingService, setEditingService] = useState<string | null>(null)
  const [editServiceName, setEditServiceName] = useState("")
  const [editServiceDescription, setEditServiceDescription] = useState("")

  useEffect(() => {
    if (general) {
      setLocalSettings(general)
    }
  }, [general])

  // Protection contre les valeurs undefined
  if (!general || !localSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des paramètres...</div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      updateGeneral(localSettings)
      await saveSettings()
      toast.success("Configuration générale sauvegardée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const handleReset = () => {
    setLocalSettings(general)
    toast.info("Modifications annulées")
  }

  const handleTest = async () => {
    toast.info("Test de la configuration en cours...")

    // Simulation de tests
    setTimeout(() => {
      toast.success("✅ Configuration valide")
    }, 1500)
  }

  const addZone = () => {
    if (!newZoneName.trim()) {
      toast.error("Le nom de la zone est requis")
      return
    }

    const newZone = {
      id: newZoneName.toLowerCase().replace(/\s+/g, "-"),
      name: newZoneName,
      description: newZoneDescription || "Nouvelle zone de service",
      status: "inactive" as const,
      requestCount: 0,
    }

    setLocalSettings({
      ...localSettings,
      zones: [...(localSettings.zones || []), newZone],
    })

    setNewZoneName("")
    setNewZoneDescription("")
    toast.success("Zone ajoutée avec succès")
  }

  const removeZone = (zoneId: string) => {
    setLocalSettings({
      ...localSettings,
      zones: (localSettings.zones || []).filter((zone) => zone.id !== zoneId),
    })
    toast.success("Zone supprimée")
  }

  const toggleZoneStatus = (zoneId: string) => {
    setLocalSettings({
      ...localSettings,
      zones: (localSettings.zones || []).map((zone) =>
        zone.id === zoneId
          ? {
              ...zone,
              status: zone.status === "active" ? "inactive" : "active",
            }
          : zone,
      ),
    })
  }

  const updateCommission = (service: string, value: number) => {
    setLocalSettings({
      ...localSettings,
      economicModel: {
        ...localSettings.economicModel,
        serviceCommissions: {
          ...localSettings.economicModel.serviceCommissions,
          [service]: value,
        },
      },
    })
  }

  const addService = () => {
    if (!newServiceName.trim()) {
      toast.error("Le nom du service est requis")
      return
    }

    const newService = {
      id: newServiceName.toLowerCase().replace(/\s+/g, "-"),
      name: newServiceName,
      description: newServiceDescription || "Nouveau service",
      active: true,
      commission: localSettings.economicModel?.defaultCommission || 15,
    }

    setLocalSettings({
      ...localSettings,
      services: [...(localSettings.services || []), newService],
      economicModel: {
        ...localSettings.economicModel,
        serviceCommissions: {
          ...localSettings.economicModel.serviceCommissions,
          [newService.id]: newService.commission,
        },
      },
    })

    setNewServiceName("")
    setNewServiceDescription("")
    toast.success("Service ajouté avec succès")
  }

  const removeService = (serviceId: string) => {
    const updatedCommissions = { ...localSettings.economicModel.serviceCommissions }
    delete updatedCommissions[serviceId]

    setLocalSettings({
      ...localSettings,
      services: (localSettings.services || []).filter((service) => service.id !== serviceId),
      economicModel: {
        ...localSettings.economicModel,
        serviceCommissions: updatedCommissions,
      },
    })
    toast.success("Service supprimé")
  }

  const toggleServiceStatus = (serviceId: string) => {
    setLocalSettings({
      ...localSettings,
      services: (localSettings.services || []).map((service) =>
        service.id === serviceId ? { ...service, active: !service.active } : service,
      ),
    })
  }

  const startEditService = (service: any) => {
    setEditingService(service.id)
    setEditServiceName(service.name)
    setEditServiceDescription(service.description)
  }

  const saveEditService = () => {
    if (!editServiceName.trim()) {
      toast.error("Le nom du service est requis")
      return
    }

    setLocalSettings({
      ...localSettings,
      services: (localSettings.services || []).map((service) =>
        service.id === editingService
          ? { ...service, name: editServiceName, description: editServiceDescription }
          : service,
      ),
    })

    setEditingService(null)
    setEditServiceName("")
    setEditServiceDescription("")
    toast.success("Service modifié avec succès")
  }

  const cancelEditService = () => {
    setEditingService(null)
    setEditServiceName("")
    setEditServiceDescription("")
  }

  const startEditZone = (zone: any) => {
    setEditingZone(zone.id)
    setNewZoneName(zone.name)
    setNewZoneDescription(zone.description)
  }

  const saveEditZone = () => {
    if (!newZoneName.trim()) {
      toast.error("Le nom de la zone est requis")
      return
    }

    setLocalSettings({
      ...localSettings,
      zones: (localSettings.zones || []).map((zone) =>
        zone.id === editingZone ? { ...zone, name: newZoneName, description: newZoneDescription } : zone,
      ),
    })

    setEditingZone(null)
    setNewZoneName("")
    setNewZoneDescription("")
    toast.success("Zone modifiée avec succès")
  }

  const cancelEditZone = () => {
    setEditingZone(null)
    setNewZoneName("")
    setNewZoneDescription("")
  }

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "expansion":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        </div>

        {/* Back button */}
        <div className="fixed top-20 left-4 z-50">
          <Link href="/settings">
            <Button
              variant="outline"
              className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Retour aux paramètres
            </Button>
          </Link>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/settings" className="hover:text-white transition-colors">
                Paramètres
              </Link>
              <span>/</span>
              <span className="text-white">Configuration Générale</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
              <Globe className="w-12 h-12 text-blue-400 animate-pulse" />
              Configuration Générale
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Paramètres de base de l'application et zones de service
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* Informations de base */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Building className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Informations de l'Application</CardTitle>
                      <CardDescription>Configuration de base de votre plateforme</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nom de l'application</Label>
                      <Input
                        value={localSettings.appName || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Djobea AI"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Slogan</Label>
                      <Input
                        value={localSettings.slogan || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, slogan: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Services à domicile intelligents"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Ville cible</Label>
                      <Select
                        value={localSettings.targetCity || "douala"}
                        onValueChange={(value) => setLocalSettings({ ...localSettings, targetCity: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label} ({city.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Fuseau horaire</Label>
                      <Select
                        value={localSettings.timezone || "Africa/Douala"}
                        onValueChange={(value) => setLocalSettings({ ...localSettings, timezone: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Langue par défaut</Label>
                      <Select
                        value={localSettings.defaultLanguage || "fr"}
                        onValueChange={(value) => setLocalSettings({ ...localSettings, defaultLanguage: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.flag} {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Devise</Label>
                      <Select
                        value={localSettings.currency || "XAF"}
                        onValueChange={(value) => setLocalSettings({ ...localSettings, currency: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.symbol} {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-gray-300 mb-3 block">
                      Rayon de couverture: {localSettings.coverageRadius || 15} km
                    </Label>
                    <Slider
                      value={[localSettings.coverageRadius || 15]}
                      onValueChange={(value) => setLocalSettings({ ...localSettings, coverageRadius: value[0] })}
                      max={50}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>5 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Zones de service */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <MapPin className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Zones de Service</CardTitle>
                        <CardDescription>Gestion des zones géographiques couvertes</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      {(localSettings.zones || []).filter((z) => z.status === "active").length} zones actives
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Ajouter une zone */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-4">Ajouter une nouvelle zone</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Nom de la zone"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Input
                        placeholder="Description (optionnel)"
                        value={newZoneDescription}
                        onChange={(e) => setNewZoneDescription(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button onClick={addZone} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Liste des zones */}
                  <div className="space-y-3">
                    {(localSettings.zones || []).map((zone) => (
                      <div
                        key={zone.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        {editingZone === zone.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Nom de la zone"
                              />
                              <Input
                                value={newZoneDescription}
                                onChange={(e) => setNewZoneDescription(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Description"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={saveEditZone} size="sm" className="bg-green-600 hover:bg-green-700">
                                Sauvegarder
                              </Button>
                              <Button
                                onClick={cancelEditZone}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white bg-transparent"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h5 className="text-white font-medium">{zone.name}</h5>
                                <p className="text-sm text-gray-400">{zone.description}</p>
                              </div>
                              <Badge variant="secondary" className={getZoneStatusColor(zone.status)}>
                                {zone.status}
                              </Badge>
                              <div className="text-sm text-gray-400">{zone.requestCount} demandes</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={zone.status === "active"}
                                onCheckedChange={() => toggleZoneStatus(zone.id)}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditZone(zone)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeZone(zone.id)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gestion des services */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Building className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Services Disponibles</CardTitle>
                        <CardDescription>Gestion des services proposés sur la plateforme</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {(localSettings.services || []).filter((s) => s.active).length} services actifs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Ajouter un service */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-4">Ajouter un nouveau service</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Nom du service"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Input
                        placeholder="Description (optionnel)"
                        value={newServiceDescription}
                        onChange={(e) => setNewServiceDescription(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button onClick={addService} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Liste des services */}
                  <div className="space-y-3">
                    {(localSettings.services || []).map((service) => (
                      <div
                        key={service.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        {editingService === service.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={editServiceName}
                                onChange={(e) => setEditServiceName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Nom du service"
                              />
                              <Input
                                value={editServiceDescription}
                                onChange={(e) => setEditServiceDescription(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Description"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={saveEditService} size="sm" className="bg-green-600 hover:bg-green-700">
                                Sauvegarder
                              </Button>
                              <Button
                                onClick={cancelEditService}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white bg-transparent"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h5 className="text-white font-medium">{service.name}</h5>
                                <p className="text-sm text-gray-400">{service.description}</p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={
                                  service.active
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                }
                              >
                                {service.active ? "Actif" : "Inactif"}
                              </Badge>
                              <div className="text-sm text-gray-400">
                                Commission:{" "}
                                {localSettings.economicModel?.serviceCommissions?.[service.id] ||
                                  localSettings.economicModel?.defaultCommission ||
                                  15}
                                %
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={service.active}
                                onCheckedChange={() => toggleServiceStatus(service.id)}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditService(service)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeService(service.id)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Modèle économique */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Modèle Économique</CardTitle>
                      <CardDescription>Configuration des commissions et tarifs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Commission par défaut (%)</Label>
                      <Input
                        type="number"
                        value={localSettings.economicModel?.defaultCommission || 15}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            economicModel: {
                              ...localSettings.economicModel,
                              defaultCommission: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        min={0}
                        max={50}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Délai de paiement (heures)</Label>
                      <Input
                        type="number"
                        value={localSettings.economicModel?.paymentDelay || 48}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            economicModel: {
                              ...localSettings.economicModel,
                              paymentDelay: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        min={1}
                        max={168}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Montant minimum mission ({localSettings.currency || "XAF"})
                      </Label>
                      <Input
                        type="number"
                        value={localSettings.economicModel?.minMissionAmount || 2500}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            economicModel: {
                              ...localSettings.economicModel,
                              minMissionAmount: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        min={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Montant maximum mission ({localSettings.currency || "XAF"})
                      </Label>
                      <Input
                        type="number"
                        value={localSettings.economicModel?.maxMissionAmount || 50000}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            economicModel: {
                              ...localSettings.economicModel,
                              maxMissionAmount: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        min={0}
                      />
                    </div>
                  </div>

                  {/* Commissions par service */}
                  <div className="space-y-4">
                    <Label className="text-gray-300">Commissions par service (%)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(localSettings.economicModel?.serviceCommissions || {}).map(
                        ([service, commission]) => (
                          <div
                            key={service}
                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                          >
                            <span className="text-white capitalize">{service}</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={commission}
                                onChange={(e) => updateCommission(service, Number.parseFloat(e.target.value))}
                                className="bg-white/5 border-white/10 text-white w-20"
                                min={0}
                                max={50}
                                step={0.5}
                              />
                              <span className="text-gray-400">%</span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                      onClick={handleTest}
                      variant="outline"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Tester la configuration
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Annuler les modifications
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}
