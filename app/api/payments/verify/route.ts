import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/payment-gateways"

export async function POST(request: NextRequest) {
  try {
    const { gateway, paymentData, orderId } = await request.json()

    if (!gateway || !paymentData || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isValid = await paymentService.verifyPayment(gateway, paymentData)

    if (!isValid) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update order status in database
    // This would typically update your order management system
    console.log(`Payment verified for order: ${orderId}`)

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
