import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity)
        break
      case "order.paid":
        await handleOrderPaid(event.payload.order.entity)
        break
      default:
        console.log(`Unhandled Razorpay webhook event: ${event.event}`)
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentCaptured(payment: any) {
  console.log("Payment captured:", payment.id)
  // Update order status to paid
  // Send confirmation email/WhatsApp
  // Update inventory
}

async function handlePaymentFailed(payment: any) {
  console.log("Payment failed:", payment.id)
  // Update order status to failed
  // Send failure notification
  // Release inventory hold
}

async function handleOrderPaid(order: any) {
  console.log("Order paid:", order.id)
  // Mark order as paid
  // Trigger fulfillment process
}
