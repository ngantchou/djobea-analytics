import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const stats = {
    totalProviders: 23,
    activeProviders: 19,
    availableProviders: 12,
    averageRating: 4.7,
  }

  return NextResponse.json(stats)
}
