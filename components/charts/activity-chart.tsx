"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"
import styled from "styled-components"

const ChartContainer = styled.div`
  position: relative;
  height: 300px;
  margin-top: 1rem;
`

interface ActivityChartProps {
  data?: {
    labels: string[]
    values: number[]
  }
}

export function ActivityChart({ data }: ActivityChartProps) {
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

    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, "rgba(103, 126, 234, 0.5)")
    gradient.addColorStop(1, "rgba(103, 126, 234, 0.05)")

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: data?.labels || ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        datasets: [
          {
            label: "Demandes",
            data: data?.values || [12, 8, 25, 42, 35, 28],
            borderColor: "#677eea",
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#677eea",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#a0a9c0",
            },
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#a0a9c0",
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
