import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get("dateRange") || "month"
    const category = searchParams.get("category") || "all"
    const type = searchParams.get("type") || "all"
    const status = searchParams.get("status") || "all"

    // Simulation de données financières
    const financesData = {
      stats: {
        totalRevenue: 2450000,
        totalExpenses: 1680000,
        netProfit: 770000,
        monthlyGrowth: 12.5,
        activeContracts: 45,
        averageOrderValue: 54444,
        cashFlow: 1250000,
        projectedRevenue: 2850000,
        revenueGoal: 3000000,
        expenseGoal: 1800000,
      },
      charts: {
        revenueVsExpenses: [
          { month: "Jan", revenue: 650000, expenses: 420000 },
          { month: "Fév", revenue: 720000, expenses: 450000 },
          { month: "Mar", revenue: 680000, expenses: 430000 },
          { month: "Avr", revenue: 750000, expenses: 480000 },
          { month: "Mai", revenue: 820000, expenses: 520000 },
          { month: "Jun", revenue: 780000, expenses: 500000 },
        ],
        categoryBreakdown: [
          { category: "Services", amount: 450000, percentage: 45 },
          { category: "Produits", amount: 320000, percentage: 32 },
          { category: "Consulting", amount: 150000, percentage: 15 },
          { category: "Formation", amount: 80000, percentage: 8 },
        ],
        cashFlowTrend: [
          { date: "Sem 1", amount: 125000 },
          { date: "Sem 2", amount: 180000 },
          { date: "Sem 3", amount: 145000 },
          { date: "Sem 4", amount: 220000 },
          { date: "Sem 5", amount: 190000 },
          { date: "Sem 6", amount: 250000 },
        ],
      },
      transactions: [
        {
          id: "1",
          date: "2024-01-15",
          description: "Paiement service plomberie",
          category: "Services",
          amount: 75000,
          type: "income",
          status: "completed",
          paymentMethod: "Virement",
        },
        {
          id: "2",
          date: "2024-01-14",
          description: "Achat matériel électrique",
          category: "Matériel",
          amount: -25000,
          type: "expense",
          status: "completed",
          paymentMethod: "Carte",
        },
        {
          id: "3",
          date: "2024-01-13",
          description: "Formation équipe technique",
          category: "Formation",
          amount: -15000,
          type: "expense",
          status: "pending",
          paymentMethod: "Chèque",
        },
        {
          id: "4",
          date: "2024-01-12",
          description: "Maintenance système",
          category: "Maintenance",
          amount: 45000,
          type: "income",
          status: "completed",
          paymentMethod: "Espèces",
        },
        {
          id: "5",
          date: "2024-01-11",
          description: "Consulting stratégique",
          category: "Consulting",
          amount: 120000,
          type: "income",
          status: "completed",
          paymentMethod: "Virement",
        },
      ],
      forecast: {
        nextMonth: {
          projectedRevenue: 850000,
          projectedExpenses: 520000,
          confidence: 78,
        },
        scenarios: {
          optimistic: 950000,
          realistic: 850000,
          pessimistic: 720000,
        },
      },
    }

    // Filtrage des données selon les paramètres
    const filteredData = { ...financesData }

    if (type !== "all") {
      filteredData.transactions = filteredData.transactions.filter((transaction) => transaction.type === type)
    }

    if (category !== "all") {
      filteredData.transactions = filteredData.transactions.filter(
        (transaction) => transaction.category.toLowerCase() === category.toLowerCase(),
      )
    }

    if (status !== "all") {
      filteredData.transactions = filteredData.transactions.filter((transaction) => transaction.status === status)
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Erreur API finances:", error)
    return NextResponse.json({ error: "Erreur lors du chargement des données financières" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulation d'ajout de transaction
    const newTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      ...body,
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: "Transaction ajoutée avec succès",
    })
  } catch (error) {
    console.error("Erreur ajout transaction:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout de la transaction" }, { status: 500 })
  }
}
