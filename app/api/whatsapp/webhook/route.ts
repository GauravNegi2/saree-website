import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified")
    return new NextResponse(challenge)
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process incoming WhatsApp messages
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      const changes = body.entry[0].changes[0]

      if (changes.field === "messages" && changes.value.messages) {
        const message = changes.value.messages[0]
        const from = message.from
        const messageBody = message.text?.body || ""

        console.log(`Received message from ${from}: ${messageBody}`)

        // Handle different message types
        await handleIncomingMessage(from, messageBody, message)
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleIncomingMessage(from: string, messageBody: string, message: any) {
  const lowerBody = messageBody.toLowerCase()

  // Handle common customer queries
  if (lowerBody.includes("order status") || lowerBody.includes("track order")) {
    // Handle order tracking requests
    await handleOrderStatusQuery(from, messageBody)
  } else if (lowerBody.includes("cart") || lowerBody.includes("checkout")) {
    // Handle cart-related queries
    await handleCartQuery(from, messageBody)
  } else if (lowerBody.includes("help") || lowerBody.includes("support")) {
    // Handle support requests
    await handleSupportQuery(from, messageBody)
  } else if (lowerBody.includes("stop") || lowerBody.includes("unsubscribe")) {
    // Handle opt-out requests
    await handleOptOut(from)
  }
}

async function handleOrderStatusQuery(from: string, messageBody: string) {
  // Implementation for order status queries
  console.log(`Handling order status query from ${from}`)
}

async function handleCartQuery(from: string, messageBody: string) {
  // Implementation for cart queries
  console.log(`Handling cart query from ${from}`)
}

async function handleSupportQuery(from: string, messageBody: string) {
  // Implementation for support queries
  console.log(`Handling support query from ${from}`)
}

async function handleOptOut(from: string) {
  // Implementation for opt-out requests
  console.log(`Handling opt-out request from ${from}`)
}
