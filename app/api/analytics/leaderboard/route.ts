import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  const providers = [
    {
      id: "1",
      name: "Jean-Baptiste Électricité",
      avatar: "JB",
      missions: 45 + Math.floor(Math.random() * 5),
      rating: 4.9,
      responseTime: 12 + Math.floor(Math.random() * 3),
      score: 98.2 + (Math.random() - 0.5) * 2,
    },
    {
      id: "2",
      name: "Marie Réparation",
      avatar: "MR",
      missions: 23 + Math.floor(Math.random() * 5),
      rating: 4.8,
      responseTime: 8 + Math.floor(Math.random() * 3),
      score: 96.7 + (Math.random() - 0.5) * 2,
    },
    {
      id: "3",
      name: "Paul Plomberie",
      avatar: "PP",
      missions: 32 + Math.floor(Math.random() * 5),
      rating: 4.6,
      responseTime: 18 + Math.floor(Math.random() * 5),
      score: 94.1 + (Math.random() - 0.5) * 2,
    },
    {
      id: "4",
      name: "Alain Maintenance",
      avatar: "AM",
      missions: 18 + Math.floor(Math.random() * 3),
      rating: 4.5,
      responseTime: 25 + Math.floor(Math.random() * 5),
      score: 91.8 + (Math.random() - 0.5) * 2,
    },
    {
      id: "5",
      name: "Francis Kono",
      avatar: "FK",
      missions: 12 + Math.floor(Math.random() * 3),
      rating: 3.2 + Math.random() * 0.5,
      responseTime: 45 + Math.floor(Math.random() * 10),
      score: 67.3 + (Math.random() - 0.5) * 5,
    },
  ]

  // Sort by score
  providers.sort((a, b) => b.score - a.score)

  return NextResponse.json(providers)
}
