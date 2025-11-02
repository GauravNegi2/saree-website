"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { CheckCircle, Package, MessageCircle, Home, ShoppingBag } from "lucide-react"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart after successful order
    clearCart()
  }, [clearCart])

  // Mock order data - in real app, this would come from URL params or API
  const orderDetails = {
    orderId: "ORD-" + Date.now().toString().slice(-6),
    amount: 4500,
    items: [{ name: "Elegant Silk Saree with Golden Border", quantity: 1, price: 4500 }],
    estimatedDelivery: "3-5 business days",
    trackingNumber: "TRK" + Date.now().toString().slice(-8),
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-700 mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
            <CardDescription>Order #{orderDetails.orderId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Total</span>
              <span className="text-2xl font-bold">₹{orderDetails.amount.toLocaleString()}</span>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items Ordered</h4>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <span>₹{item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <Badge variant="outline">{orderDetails.estimatedDelivery}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Tracking Number</span>
                <span className="font-mono text-sm">{orderDetails.trackingNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">WhatsApp Updates Enabled</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You'll receive order updates, shipping notifications, and delivery confirmations on WhatsApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/account/orders">
              <Package className="mr-2 h-4 w-4" />
              Track Your Order
            </Link>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/collections">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact our support team at support@elegance.com or call +91 98765 43210</p>
        </div>
      </div>
    </div>
  )
}
