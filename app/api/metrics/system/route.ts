import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulation de métriques système
    const metrics = {
      cpu: Math.floor(Math.random() * 30) + 30,
      memory: Math.floor(Math.random() * 40) + 40,
      disk: Math.floor(Math.random() * 20) + 30,
      network: Math.floor(Math.random() * 30) + 20,
      responseTime: Math.floor(Math.random() * 100) + 100,
      uptime: 99.8 + Math.random() * 0.2,
      errorRate: Math.random() * 0.1,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Erreur récupération métriques:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
