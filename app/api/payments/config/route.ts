import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const config = {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Payment config error:", error)
    return NextResponse.json({ error: "Failed to fetch payment config" }, { status: 500 })
  }
}
