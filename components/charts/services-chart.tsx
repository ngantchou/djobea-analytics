"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"
import styled from "styled-components"

const ChartContainer = styled.div`
  position: relative;
  height: 300px;
  margin-top: 1rem;
`

interface ServicesChartProps {
  data?: {
    labels: string[]
    values: number[]
  }
}

export function ServicesChart({ data }: ServicesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const config: ChartConfiguration = {
      type: "doughnut",
      data: {
        labels: data?.labels || ["Plomberie", "Électricité", "Électroménager"],
        datasets: [
          {
            data: data?.values || [45, 35, 20],
            backgroundColor: ["#4facfe", "#43e97b", "#fa709a"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#a0a9c0",
              padding: 20,
            },
          },
        },
      },
    }

    chartRef.current = new Chart(ctx, config)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  return (
    <ChartContainer>
      <canvas ref={canvasRef} />
    </ChartContainer>
  )
}
