"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface OrderConfirmationProps {
  orderId: string
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart after successful order
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card>
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-serif">Order Confirmed!</CardTitle>
          <p className="text-muted-foreground">Thank you for your purchase. Your order has been successfully placed.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Order Number</div>
            <div className="text-lg font-semibold">{orderId}</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">WhatsApp Notification Sent</div>
                <div className="text-sm text-muted-foreground">Order confirmation sent to your WhatsApp number</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Processing Your Order</div>
                <div className="text-sm text-muted-foreground">
                  We'll send you tracking details once your order ships
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/account">
                View Order Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/collections">Continue Shopping</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Questions about your order? Contact us at{" "}
              <a href="mailto:support@elegance.com" className="text-primary hover:underline">
                support@elegance.com
              </a>{" "}
              or call{" "}
              <a href="tel:+919876543210" className="text-primary hover:underline">
                +91 98765 43210
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
