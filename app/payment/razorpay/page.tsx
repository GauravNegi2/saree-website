"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [paymentConfig, setPaymentConfig] = useState<{ razorpayKeyId: string } | null>(null)

  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    const fetchPaymentConfig = async () => {
      try {
        const response = await fetch("/api/payments/config")
        if (response.ok) {
          const config = await response.json()
          setPaymentConfig(config)
        }
      } catch (error) {
        console.error("Failed to fetch payment config:", error)
      }
    }

    fetchPaymentConfig()

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!orderId || !amount || !paymentConfig?.razorpayKeyId) {
      alert("Missing payment details or configuration")
      return
    }

    setIsLoading(true)

    const options = {
      key: paymentConfig.razorpayKeyId,
      amount: Number.parseFloat(amount) * 100,
      currency: "INR",
      name: "Elegance Sarees",
      description: "Premium Saree Collection",
      order_id: orderId,
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gateway: "razorpay",
              paymentData: {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
              orderId: orderId,
            }),
          })

          if (verifyResponse.ok) {
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/checkout/success")
            }, 2000)
          } else {
            setPaymentStatus("failed")
          }
        } catch (error) {
          console.error("Payment verification error:", error)
          setPaymentStatus("failed")
        }
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false)
          setPaymentStatus("failed")
        },
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#8B5CF6",
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setIsLoading(false)
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
              <p className="text-muted-foreground">Your order has been confirmed and will be processed shortly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
              <p className="text-muted-foreground">There was an issue processing your payment. Please try again.</p>
              <Button onClick={() => setPaymentStatus("pending")} className="w-full">
                Retry Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </CardTitle>
          <CardDescription>Secure payment powered by Razorpay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">₹{amount}</div>
            <p className="text-muted-foreground">Order ID: {orderId}</p>
          </div>

          <Button onClick={handlePayment} disabled={isLoading || !paymentConfig} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !paymentConfig ? (
              "Loading..."
            ) : (
              "Pay Now"
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            <p>Secured by Razorpay • 256-bit SSL encryption</p>
            <p>We accept all major credit cards, debit cards, and UPI</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
