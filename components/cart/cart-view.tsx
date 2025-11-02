"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "./cart-item"
import { ShoppingBag, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function CartView() {
  const { state } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)

  const shipping = state.total > 5000 ? 0 : 299
  const tax = Math.round(state.total * 0.18) // 18% GST
  const finalTotal = state.total + shipping + tax - discount

  const handleApplyPromo = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === "welcome10") {
      const discountAmount = Math.round(state.total * 0.1)
      setDiscount(discountAmount)
      setPromoApplied(true)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
          <p className="text-lg text-muted-foreground mb-8">Discover our beautiful collection of premium sarees</p>
          <Button asChild size="lg">
            <Link href="/collections">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">{state.itemCount} items in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              {shipping > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  Add ₹{(5000 - state.total).toLocaleString()} more for free shipping
                </div>
              )}

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <Button variant="outline" onClick={handleApplyPromo} disabled={promoApplied || !promoCode}>
                    <Tag className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      WELCOME10 Applied
                    </Badge>
                    <span>10% discount applied!</span>
                  </div>
                )}
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/collections">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
