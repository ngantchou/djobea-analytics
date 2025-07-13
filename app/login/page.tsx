"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, BotIcon as Robot, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotificationStore } from "@/store/use-notification-store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const router = useRouter()
  const { addNotification } = useNotificationStore()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulation d'authentification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Vérification des identifiants (simulation)
      if (email === "admin@djobea.com" && password === "admin123") {
        addNotification({
          title: "Connexion réussie",
          message: "Bienvenue dans Djobea Analytics !",
          type: "success",
        })

        // Simulation de sauvegarde du token
        if (rememberMe) {
          localStorage.setItem("djobea_remember", "true")
        }
        localStorage.setItem("djobea_token", "mock_jwt_token")
        localStorage.setItem(
          "djobea_user",
          JSON.stringify({
            id: "1",
            name: "Admin Djobea",
            email: "admin@djobea.com",
            role: "admin",
          }),
        )

        router.push("/")
      } else {
        addNotification({
          title: "Erreur de connexion",
          message: "Email ou mot de passe incorrect",
          type: "error",
        })
      }
    } catch (error) {
      addNotification({
        title: "Erreur",
        message: "Une erreur est survenue lors de la connexion",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: BarChart3,
      title: "Analytics Avancées",
      description: "Tableaux de bord intelligents et insights en temps réel",
    },
    {
      icon: Zap,
      title: "Performance Optimale",
      description: "Interface rapide et réactive pour une productivité maximale",
    },
    {
      icon: Shield,
      title: "Sécurité Renforcée",
      description: "Protection des données avec chiffrement de bout en bout",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Robot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Djobea Analytics
                </h1>
                <p className="text-gray-400 text-lg">Tableau de bord intelligent</p>
              </div>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed">
              Gérez vos services à Douala avec une plateforme d'analytics avancée et des insights en temps réel.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-800/20 border border-gray-700/30">
              <div className="text-2xl font-bold text-blue-400">99.9%</div>
              <div className="text-xs text-gray-400">Uptime</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-800/20 border border-gray-700/30">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-gray-400">Support</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-800/20 border border-gray-700/30">
              <div className="text-2xl font-bold text-green-400">1000+</div>
              <div className="text-xs text-gray-400">Utilisateurs</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="space-y-4 text-center">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Robot className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold text-white">Connexion</CardTitle>
                <CardDescription className="text-gray-400">
                  Accédez à votre tableau de bord Djobea Analytics
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@djobea.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300">
                      Se souvenir de moi
                    </Label>
                  </div>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                    Mot de passe oublié ?
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-sm font-medium mb-2">Identifiants de démonstration :</p>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>
                    <strong>Email :</strong> admin@djobea.com
                  </p>
                  <p>
                    <strong>Mot de passe :</strong> admin123
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-400">
                Pas encore de compte ?{" "}
                <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                  Contactez l'administrateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
