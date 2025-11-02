import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/payment-gateways"

export async function POST(request: NextRequest) {
  try {
    const { amount, gateway, paymentMethod, orderDetails } = await request.json()

    if (!amount || !gateway || !paymentMethod || !orderDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await paymentService.processPayment(gateway, amount, paymentMethod, orderDetails)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
