import { type NextRequest, NextResponse } from "next/server"
import { whatsappService } from "@/lib/whatsapp"
import { cartTrackingService } from "@/lib/cart-tracking"

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerInfo, orderTotal, sessionId } = await request.json()

    if (!orderId || !customerInfo || !orderTotal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send WhatsApp order confirmation
    if (customerInfo.phoneNumber && customerInfo.whatsappConsent) {
      await whatsappService.sendOrderConfirmation(customerInfo.phoneNumber, customerInfo.name, orderId, orderTotal)
    }

    // Mark cart as completed
    if (sessionId) {
      cartTrackingService.markCartAsCompleted(sessionId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order confirmation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
