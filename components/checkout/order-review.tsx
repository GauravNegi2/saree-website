"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { ShippingAddress, PaymentMethod } from "./checkout-flow"
import { MapPin, CreditCard, Package, CheckCircle } from "lucide-react"

interface OrderReviewProps {
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  onPlaceOrder: () => void
}

export function OrderReview({ shippingAddress, paymentMethod, onPlaceOrder }: OrderReviewProps) {
  const { state } = useCart()

  const shipping = state.total > 5000 ? 0 : 299
  const tax = Math.round(state.total * 0.18)
  const finalTotal = state.total + shipping + tax

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod.type) {
      case "card":
        return `Card ending in ${paymentMethod.details?.number?.slice(-4) || "****"}`
      case "upi":
        return `UPI: ${paymentMethod.details?.upiId || ""}`
      case "netbanking":
        return `Net Banking: ${paymentMethod.details?.bank || ""}`
      case "cod":
        return "Cash on Delivery"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-medium">{shippingAddress.fullName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {shippingAddress.addressLine1}
                {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
              </div>
              <div className="text-sm text-muted-foreground">{shippingAddress.phone}</div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-medium">{getPaymentMethodDisplay()}</div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Package className="h-4 w-4" />
              Order Items ({state.itemCount} items)
            </h3>
            <div className="space-y-3">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-16 h-20 flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.color && (
                      <Badge variant="outline" className="mt-1 capitalize">
                        {item.color}
                      </Badge>
                    )}
                    <div className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{state.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <Button onClick={onPlaceOrder} className="w-full" size="lg">
            Place Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
