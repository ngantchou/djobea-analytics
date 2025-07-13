import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()

    // Validate required fields
    const requiredFields = ["type", "amount", "category", "description", "paymentMethod", "date"]
    for (const field of requiredFields) {
      if (!transactionData[field]) {
        return NextResponse.json({ error: `Le champ ${field} est requis` }, { status: 400 })
      }
    }

    // Generate transaction ID and reference
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const reference = `REF-${Date.now().toString().slice(-6)}`

    const newTransaction = {
      id: transactionId,
      reference,
      ...transactionData,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real implementation, save to database
    console.log("Nouvelle transaction:", newTransaction)

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"
    const type = searchParams.get("type") || "all"

    // Mock transactions data
    let transactions = [
      {
        id: "1",
        date: "2024-01-15",
        type: "income",
        category: "services",
        description: "Prestation de service - Client ABC",
        amount: 1500,
        paymentMethod: "transfer",
        status: "completed",
        reference: "REF-001",
      },
      {
        id: "2",
        date: "2024-01-14",
        type: "expense",
        category: "marketing",
        description: "Campagne publicitaire Google Ads",
        amount: 250,
        paymentMethod: "card",
        status: "completed",
        reference: "REF-002",
      },
      // Add more mock transactions...
    ]

    // Apply filters
    if (search) {
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.reference.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (category !== "all") {
      transactions = transactions.filter((t) => t.category === category)
    }

    if (status !== "all") {
      transactions = transactions.filter((t) => t.status === status)
    }

    if (type !== "all") {
      transactions = transactions.filter((t) => t.type === type)
    }

    // Pagination
    const total = transactions.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = transactions.slice(startIndex, endIndex)

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erreur récupération transactions:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des transactions" }, { status: 500 })
  }
}
