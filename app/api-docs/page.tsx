"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Download, Code, Globe, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import swaggerDoc from "@/docs/swagger.json"

interface ApiEndpoint {
  path: string
  method: string
  summary: string
  description: string
  tags: string[]
  parameters?: any[]
  requestBody?: any
  responses: any
}

export default function ApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")

  // Extract endpoints from swagger doc
  const endpoints = useMemo(() => {
    const allEndpoints: ApiEndpoint[] = []

    Object.entries(swaggerDoc.paths).forEach(([path, pathData]) => {
      Object.entries(pathData as any).forEach(([method, methodData]: [string, any]) => {
        allEndpoints.push({
          path,
          method: method.toUpperCase(),
          summary: methodData.summary || "",
          description: methodData.description || "",
          tags: methodData.tags || [],
          parameters: methodData.parameters,
          requestBody: methodData.requestBody,
          responses: methodData.responses,
        })
      })
    })

    return allEndpoints
  }, [])

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((endpoint) => {
      const matchesSearch =
        endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTag = selectedTag === "all" || endpoint.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [endpoints, searchTerm, selectedTag])

  // Get unique tags
  const tags = useMemo(() => {
    const allTags = new Set<string>()
    endpoints.forEach((endpoint) => {
      endpoint.tags.forEach((tag) => allTags.add(tag))
    })
    return Array.from(allTags).sort()
  }, [endpoints])

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "POST":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "PUT":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "DELETE":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "PATCH":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const downloadSwagger = () => {
    const dataStr = JSON.stringify(swaggerDoc, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "djobea-api-swagger.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Documentation API Djobea
              </h1>
              <p className="text-gray-400 text-lg">API complète pour la plateforme de gestion de services à domicile</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  <Globe className="w-3 h-3 mr-1" />
                  Version {swaggerDoc.info.version}
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  {endpoints.length} Endpoints
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Production Ready
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={downloadSwagger}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger Swagger
              </Button>
              <Button
                onClick={() => window.open("/api-docs/swagger-ui", "_blank")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Code className="w-4 h-4 mr-2" />
                Swagger UI
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher des endpoints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag("all")}
                    className={selectedTag === "all" ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    Tous ({endpoints.length})
                  </Button>
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className={selectedTag === tag ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                    >
                      {tag} ({endpoints.filter((e) => e.tags.includes(tag)).length})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="authentication" className="data-[state=active]:bg-gray-700">
                Authentification
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-gray-700">
                Exemples
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">À propos de l'API</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>{swaggerDoc.info.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Serveurs</h4>
                      <ul className="space-y-1">
                        {swaggerDoc.servers.map((server, index) => (
                          <li key={index} className="text-sm">
                            <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">{server.url}</code>
                            <span className="ml-2 text-gray-400">- {server.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Contact</h4>
                      <p className="text-sm">
                        Email: <span className="text-blue-400">{swaggerDoc.info.contact.email}</span>
                      </p>
                      <p className="text-sm">Équipe: {swaggerDoc.info.contact.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Authentification</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>L'API Djobea supporte deux méthodes d'authentification :</p>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Bearer Token (JWT)</h4>
                      <p className="text-sm mb-2">Ajoutez le token dans l'en-tête Authorization :</p>
                      <code className="block bg-gray-900 p-2 rounded text-green-400 text-sm">
                        Authorization: Bearer YOUR_JWT_TOKEN
                      </code>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">API Key</h4>
                      <p className="text-sm mb-2">Ajoutez la clé API dans l'en-tête :</p>
                      <code className="block bg-gray-900 p-2 rounded text-green-400 text-sm">
                        X-API-Key: YOUR_API_KEY
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Exemples d'utilisation</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Récupérer les données du dashboard</h4>
                    <code className="block bg-gray-900 p-3 rounded text-green-400 text-sm whitespace-pre">
                      {`curl -X GET "https://djobea-analytics.vercel.app/api/dashboard" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`}
                    </code>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Créer une nouvelle demande</h4>
                    <code className="block bg-gray-900 p-3 rounded text-green-400 text-sm whitespace-pre">
                      {`curl -X POST "https://djobea-analytics.vercel.app/api/requests" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client": {
      "name": "Jean Dupont",
      "phone": "+237 6 12 34 56 78",
      "email": "jean.dupont@email.com"
    },
    "service": {
      "type": "Plomberie",
      "description": "Fuite robinet cuisine"
    },
    "location": "Bonamoussadi Centre",
    "priority": "urgent"
  }'`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Endpoints List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, index) => (
              <motion.div
                key={`${endpoint.method}-${endpoint.path}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                          <code className="text-blue-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          {endpoint.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{endpoint.summary}</h3>
                        <p className="text-gray-400 text-sm">{endpoint.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const curlCommand = `curl -X ${endpoint.method} "${swaggerDoc.servers[0].url}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`
                            navigator.clipboard.writeText(curlCommand)
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Code className="w-4 h-4 mr-1" />
                          cURL
                        </Button>
                      </div>
                    </div>

                    {/* Parameters */}
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-semibold text-white mb-2">Paramètres</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="text-sm">
                              <code className="text-blue-400">{param.name}</code>
                              <span className="text-gray-400 ml-2">
                                ({param.in}) - {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responses */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-semibold text-white mb-2">Réponses</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                          <Badge
                            key={code}
                            variant="outline"
                            className={
                              code.startsWith("2")
                                ? "border-green-500/30 text-green-400"
                                : code.startsWith("4")
                                  ? "border-yellow-500/30 text-yellow-400"
                                  : "border-red-500/30 text-red-400"
                            }
                          >
                            {code} - {response.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredEndpoints.length === 0 && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun endpoint trouvé</h3>
                <p className="text-gray-400">Essayez de modifier vos critères de recherche ou de filtrage.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
