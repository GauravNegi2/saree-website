import { type NextRequest, NextResponse } from "next/server"
import { cartTrackingService } from "@/lib/cart-tracking"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, cartItems, userInfo } = await request.json()

    if (!sessionId || !cartItems) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Track cart update
    cartTrackingService.trackCartUpdate(sessionId, cartItems, userInfo)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
