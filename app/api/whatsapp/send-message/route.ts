import { type NextRequest, NextResponse } from "next/server"

interface WhatsAppMessageRequest {
  to: string
  message: string
  type: "cart_update" | "cart_abandonment" | "order_confirmation" | "shipping_update"
  customerId: string
  orderId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppMessageRequest = await request.json()
    const { to, message, type, customerId, orderId } = body

    // Validate required fields
    if (!to || !message || !type || !customerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate WhatsApp number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(to)) {
      return NextResponse.json({ error: "Invalid WhatsApp number format" }, { status: 400 })
    }

    // Get WhatsApp Business API credentials
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      console.error("WhatsApp credentials not configured")
      return NextResponse.json({ error: "WhatsApp service not configured" }, { status: 500 })
    }

    // Send message via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\s+/g, ""), // Remove spaces from phone number
        type: "text",
        text: {
          body: message,
        },
      }),
    })

    if (!whatsappResponse.ok) {
      const errorData = await whatsappResponse.json()
      console.error("WhatsApp API error:", errorData)
      return NextResponse.json({ error: "Failed to send WhatsApp message", details: errorData }, { status: 500 })
    }

    const responseData = await whatsappResponse.json()

    // Log the message for analytics (in a real app, save to database)
    console.log(`WhatsApp message sent:`, {
      messageId: responseData.messages?.[0]?.id,
      to,
      type,
      customerId,
      orderId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      messageId: responseData.messages?.[0]?.id,
      message: "WhatsApp message sent successfully",
    })
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
