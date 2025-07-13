import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { providerId, message } = await request.json()
    const requestId = params.id

    // Simulate API call to send message to provider
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Mock response
    const response = {
      success: true,
      message: "Message sent to provider successfully",
      data: {
        requestId,
        providerId,
        message,
        sentAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
