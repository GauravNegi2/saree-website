"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckoutSteps } from "./checkout-steps"
import { ShippingForm } from "./shipping-form"
import { PaymentForm } from "./payment-form"
import { OrderReview } from "./order-review"
import { OrderConfirmation } from "./order-confirmation"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
}

export interface PaymentMethod {
  type: "card" | "upi" | "netbanking" | "cod"
  details?: any
}

export function CheckoutFlow() {
  const { state } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")

  const shipping = state.total > 5000 ? 0 : 299
  const tax = Math.round(state.total * 0.18)
  const finalTotal = state.total + shipping + tax

  useEffect(() => {
    if (state.items.length === 0 && !orderPlaced) {
      // Redirect to cart if empty
      window.location.href = "/cart"
    }
  }, [state.items.length, orderPlaced])

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address)
    setCurrentStep(2)
  }

  const handlePaymentSubmit = (payment: PaymentMethod) => {
    setPaymentMethod(payment)
    setCurrentStep(3)
  }

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalTotal,
          paymentMethod,
          shippingAddress,
          items: state.items,
        }),
      })

      const result = await response.json()

      if (result.success) {
        if (paymentMethod?.type === "cod") {
          // For COD, directly show success
          const newOrderId = `ORD-${Date.now()}`
          setOrderId(newOrderId)
          setOrderPlaced(true)
          setCurrentStep(4)
        } else {
          // For online payments, redirect to Razorpay
          window.location.href = result.redirectUrl
        }
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Order placement error:", error)
      alert("Failed to place order. Please try again.")
    }
  }

  if (orderPlaced) {
    return <OrderConfirmation orderId={orderId} />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">{state.itemCount} items in your order</p>
      </div>

      <CheckoutSteps currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && <ShippingForm onSubmit={handleShippingSubmit} />}
          {currentStep === 2 && <PaymentForm onSubmit={handlePaymentSubmit} />}
          {currentStep === 3 && (
            <OrderReview
              shippingAddress={shippingAddress!}
              paymentMethod={paymentMethod!}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{state.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              {shipping > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Add ₹{(5000 - state.total).toLocaleString()} more for free shipping
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
