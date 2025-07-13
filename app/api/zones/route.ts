import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const zones = [
    {
      id: "zone_1",
      name: "Bonamoussadi Centre",
      code: "BMC",
      coordinates: {
        lat: 4.0511,
        lng: 9.7679,
      },
      activeProviders: 23,
      totalRequests: 156,
      averageResponseTime: 12,
    },
    {
      id: "zone_2",
      name: "Bonamoussadi Nord",
      code: "BMN",
      coordinates: {
        lat: 4.0611,
        lng: 9.7579,
      },
      activeProviders: 18,
      totalRequests: 89,
      averageResponseTime: 15,
    },
    {
      id: "zone_3",
      name: "Bonamoussadi Sud",
      code: "BMS",
      coordinates: {
        lat: 4.0411,
        lng: 9.7779,
      },
      activeProviders: 15,
      totalRequests: 67,
      averageResponseTime: 18,
    },
    {
      id: "zone_4",
      name: "Bonamoussadi Est",
      code: "BME",
      coordinates: {
        lat: 4.0511,
        lng: 9.7879,
      },
      activeProviders: 12,
      totalRequests: 45,
      averageResponseTime: 22,
    },
    {
      id: "zone_5",
      name: "Akwa",
      code: "AKW",
      coordinates: {
        lat: 4.0311,
        lng: 9.7079,
      },
      activeProviders: 28,
      totalRequests: 203,
      averageResponseTime: 10,
    },
    {
      id: "zone_6",
      name: "Deido",
      code: "DEI",
      coordinates: {
        lat: 4.0711,
        lng: 9.7279,
      },
      activeProviders: 21,
      totalRequests: 134,
      averageResponseTime: 14,
    },
  ]

  return NextResponse.json({
    success: true,
    data: zones,
    total: zones.length,
  })
}
