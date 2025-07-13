"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SwaggerUIPage() {
  const swaggerUIRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real application, you would load Swagger UI here
    // For now, we'll show a placeholder
    if (swaggerUIRef.current) {
      swaggerUIRef.current.innerHTML = `
        <div class="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div class="text-center">
            <h3 class="text-lg font-semibold mb-2">Swagger UI Integration</h3>
            <p class="text-muted-foreground mb-4">
              To enable Swagger UI, install swagger-ui-react and configure it with your API specification.
            </p>
            <div class="bg-background p-4 rounded border text-left">
              <code class="text-sm">
                npm install swagger-ui-react<br/>
                npm install swagger-ui-react-dom
              </code>
            </div>
          </div>
        </div>
      `
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/api-docs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Docs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Swagger UI</h1>
            <p className="text-muted-foreground mt-2">Interactive API documentation and testing interface</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/docs/swagger.json" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View JSON
            </a>
          </Button>
        </div>
      </div>

      {/* Swagger UI Container */}
      <Card>
        <CardHeader>
          <CardTitle>API Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={swaggerUIRef} />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Install Dependencies</h4>
            <div className="bg-muted p-3 rounded-lg">
              <code className="text-sm">npm install swagger-ui-react swagger-ui-react-dom</code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Import and Configure</h4>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-sm">
                {`import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

<SwaggerUI url="/docs/swagger.json" />`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Features Available</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Interactive API testing</li>
              <li>Request/response examples</li>
              <li>Schema validation</li>
              <li>Authentication testing</li>
              <li>Code generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
