// Payment gateway integrations for Razorpay only
interface PaymentOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId?: string
  error?: string
  redirectUrl?: string
}

// Razorpay Integration
class RazorpayService {
  private keyId: string
  private keySecret: string

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || ""
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || ""
  }

  async createOrder(amount: number, currency = "INR", receipt: string): Promise<PaymentOrder | null> {
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt,
          payment_capture: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Razorpay order")
      }

      const order = await response.json()
      return {
        id: order.id,
        amount: order.amount / 100, // Convert back to rupees
        currency: order.currency,
        receipt: order.receipt,
      }
    } catch (error) {
      console.error("Razorpay order creation error:", error)
      return null
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex")

      return expectedSignature === signature
    } catch (error) {
      console.error("Razorpay payment verification error:", error)
      return false
    }
  }

  async capturePayment(paymentId: string, amount: number): Promise<boolean> {
    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Razorpay payment capture error:", error)
      return false
    }
  }
}

// Unified Payment Service - Razorpay and COD only
class PaymentService {
  private razorpay: RazorpayService

  constructor() {
    this.razorpay = new RazorpayService()
  }

  async processPayment(
    gateway: "razorpay",
    amount: number,
    paymentMethod: any,
    orderDetails: any,
  ): Promise<PaymentResult> {
    try {
      return await this.processRazorpayPayment(amount, paymentMethod, orderDetails)
    } catch (error) {
      console.error("Payment processing error:", error)
      return { success: false, error: "Payment processing failed" }
    }
  }

  private async processRazorpayPayment(amount: number, paymentMethod: any, orderDetails: any): Promise<PaymentResult> {
    if (paymentMethod.type === "cod") {
      return {
        success: true,
        paymentId: `cod_${Date.now()}`,
        orderId: orderDetails.orderId,
      }
    }

    const order = await this.razorpay.createOrder(amount, "INR", orderDetails.orderId)
    if (!order) {
      return { success: false, error: "Failed to create payment order" }
    }

    return {
      success: true,
      orderId: order.id,
      redirectUrl: `/payment/razorpay?orderId=${order.id}&amount=${amount}`,
    }
  }

  async verifyPayment(gateway: "razorpay", paymentData: any): Promise<boolean> {
    return await this.razorpay.verifyPayment(paymentData.paymentId, paymentData.orderId, paymentData.signature)
  }
}

export const paymentService = new PaymentService()
export { RazorpayService }
