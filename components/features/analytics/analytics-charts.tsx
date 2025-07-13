"use client"

import { Line, Doughnut, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from "chart.js"
import styled from "styled-components"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
)

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const ChartCard = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
`

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const ChartContainer = styled.div`
  height: 300px;
  position: relative;
`

const ServicesGrid = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`

interface AnalyticsChartsProps {
  data?: {
    performance: {
      labels: string[]
      successRate: number[]
      aiEfficiency: number[]
      satisfaction: number[]
    }
    services: {
      labels: string[]
      data: number[]
    }
    geographic: {
      labels: string[]
      data: number[]
    }
  }
  period: string
}

export function AnalyticsCharts({ data, period }: AnalyticsChartsProps) {
  const performanceData = {
    labels: data?.performance?.labels || ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        label: "Taux de Réussite",
        data: data?.performance?.successRate || [85, 87, 89, 91, 88, 92, 90],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Efficacité IA",
        data: data?.performance?.aiEfficiency || [90, 92, 94, 96, 93, 97, 95],
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(168, 85, 247)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "Satisfaction",
        data: data?.performance?.satisfaction || [4.5, 4.6, 4.8, 4.7, 4.9, 4.8, 4.9],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  }

  const servicesData = {
    labels: data?.services?.labels || ["Plomberie", "Électricité", "Électroménager", "Maintenance"],
    datasets: [
      {
        data: data?.services?.data || [45, 35, 15, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 0,
        hoverOffset: 15,
        cutout: "70%",
      },
    ],
  }

  const geographicData = {
    labels: data?.geographic?.labels || [
      "Bonamoussadi Centre",
      "Bonamoussadi Nord",
      "Bonamoussadi Sud",
      "Bonamoussadi Est",
    ],
    datasets: [
      {
        label: "Demandes",
        data: data?.geographic?.data || [58, 32, 28, 15],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: ["rgb(59, 130, 246)", "rgb(168, 85, 247)", "rgb(34, 197, 94)", "rgb(239, 68, 68)"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  return (
    <>
      <ChartsGrid>
        <ChartCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <ChartHeader>
            <ChartTitle>
              <TrendingUp />
              Évolution des Performances
            </ChartTitle>
          </ChartHeader>
          <ChartContainer>
            <Line data={performanceData} options={chartOptions} />
          </ChartContainer>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ChartHeader>
            <ChartTitle>
              <PieChart />
              Répartition des Services
            </ChartTitle>
          </ChartHeader>
          <ChartContainer>
            <Doughnut data={servicesData} options={chartOptions} />
          </ChartContainer>
        </ChartCard>
      </ChartsGrid>

      <ServicesGrid>
        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ChartHeader>
            <ChartTitle>
              <BarChart3 />
              Couverture Géographique
            </ChartTitle>
          </ChartHeader>
          <ChartContainer>
            <Bar data={geographicData} options={chartOptions} />
          </ChartContainer>
        </ChartCard>
      </ServicesGrid>
    </>
  )
}
