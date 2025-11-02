"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"

interface OrderSummaryProps {
  showTitle?: boolean
  className?: string
}

export function OrderSummary({ showTitle = true, className }: OrderSummaryProps) {
  const { state } = useCart()

  const subtotal = state.total
  const shipping = subtotal > 1999 ? 0 : 99
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({state.itemCount} items)</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
          </div>

          {shipping === 0 && subtotal > 1999 && (
            <div className="text-xs text-green-600">🎉 You saved ₹99 on shipping!</div>
          )}

          {subtotal < 1999 && subtotal > 0 && (
            <div className="text-xs text-muted-foreground">
              Add ₹{(1999 - subtotal).toLocaleString()} more for free shipping
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Tax (GST 18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
