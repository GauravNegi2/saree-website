interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Customer {
  id: string
  name: string
  email: string
  whatsappNumber: string
  whatsappConsent: boolean
}

interface CartNotificationData {
  customer: Customer
  cartItems: CartItem[]
  cartTotal: number
  cartUrl: string
  abandonedAt: Date
}

export class WhatsAppCartNotificationService {
  private static instance: WhatsAppCartNotificationService
  private baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  static getInstance(): WhatsAppCartNotificationService {
    if (!WhatsAppCartNotificationService.instance) {
      WhatsAppCartNotificationService.instance = new WhatsAppCartNotificationService()
    }
    return WhatsAppCartNotificationService.instance
  }

  // Send immediate cart update notification
  async sendCartUpdateNotification(data: CartNotificationData): Promise<boolean> {
    if (!data.customer.whatsappConsent) {
      console.log(`Customer ${data.customer.name} has not consented to WhatsApp messages`)
      return false
    }

    try {
      const message = this.generateCartUpdateMessage(data)

      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.customer.whatsappNumber,
          message: message,
          type: "cart_update",
          customerId: data.customer.id,
        }),
      })

      if (response.ok) {
        console.log(`Cart update notification sent to ${data.customer.name}`)
        return true
      } else {
        console.error("Failed to send cart update notification:", await response.text())
        return false
      }
    } catch (error) {
      console.error("Error sending cart update notification:", error)
      return false
    }
  }

  // Send cart abandonment reminder after delay
  async scheduleCartAbandonmentReminder(data: CartNotificationData, delayMinutes = 60): Promise<void> {
    if (!data.customer.whatsappConsent) {
      return
    }

    // Schedule the reminder (in a real app, you'd use a job queue like Bull or Agenda)
    setTimeout(
      async () => {
        try {
          // Check if cart is still abandoned
          const isStillAbandoned = await this.checkIfCartStillAbandoned(data.customer.id)

          if (isStillAbandoned) {
            const message = this.generateAbandonmentReminderMessage(data)

            await fetch("/api/whatsapp/send-message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: data.customer.whatsappNumber,
                message: message,
                type: "cart_abandonment",
                customerId: data.customer.id,
              }),
            })

            console.log(`Cart abandonment reminder sent to ${data.customer.name}`)
          }
        } catch (error) {
          console.error("Error sending cart abandonment reminder:", error)
        }
      },
      delayMinutes * 60 * 1000,
    )
  }

  // Send order confirmation
  async sendOrderConfirmation(orderId: string, customer: Customer, orderTotal: number): Promise<boolean> {
    if (!customer.whatsappConsent) {
      return false
    }

    try {
      const message = this.generateOrderConfirmationMessage(customer.name, orderId, orderTotal)

      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: customer.whatsappNumber,
          message: message,
          type: "order_confirmation",
          customerId: customer.id,
          orderId: orderId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error sending order confirmation:", error)
      return false
    }
  }

  // Send shipping update
  async sendShippingUpdate(
    orderId: string,
    customer: Customer,
    trackingNumber: string,
    estimatedDelivery: string,
  ): Promise<boolean> {
    if (!customer.whatsappConsent) {
      return false
    }

    try {
      const message = this.generateShippingUpdateMessage(customer.name, orderId, trackingNumber, estimatedDelivery)

      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: customer.whatsappNumber,
          message: message,
          type: "shipping_update",
          customerId: customer.id,
          orderId: orderId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error sending shipping update:", error)
      return false
    }
  }

  private generateCartUpdateMessage(data: CartNotificationData): string {
    const itemsList = data.cartItems
      .slice(0, 3) // Show max 3 items
      .map((item) => `• ${item.name} (₹${item.price.toLocaleString()})`)
      .join("\n")

    const moreItems = data.cartItems.length > 3 ? `\n...and ${data.cartItems.length - 3} more items` : ""

    return `🛍️ Hi ${data.customer.name}!

Your cart has been updated with these beautiful sarees:

${itemsList}${moreItems}

💰 Total: ₹${data.cartTotal.toLocaleString()}

Complete your purchase now: ${this.baseUrl}/cart

✨ Need help? Reply to this message and we'll assist you!

- Team Elegance Sarees`
  }

  private generateAbandonmentReminderMessage(data: CartNotificationData): string {
    const discount = "SAVE10" // You could make this dynamic

    return `🌟 Hi ${data.customer.name}!

You left some gorgeous sarees in your cart. Don't miss out on these beautiful pieces!

🛍️ Cart Total: ₹${data.cartTotal.toLocaleString()}

🎁 Special offer: Use code ${discount} for 10% off your order!

Complete your purchase: ${this.baseUrl}/cart

⏰ This offer expires in 24 hours.

- Team Elegance Sarees`
  }

  private generateOrderConfirmationMessage(customerName: string, orderId: string, total: number): string {
    return `🎉 Thank you ${customerName}!

Your order has been confirmed:
📦 Order #${orderId}
💰 Total: ₹${total.toLocaleString()}

We'll start preparing your beautiful sarees right away and notify you once they're shipped.

Track your order: ${this.baseUrl}/account

Need help? Reply to this message!

- Team Elegance Sarees`
  }

  private generateShippingUpdateMessage(
    customerName: string,
    orderId: string,
    trackingNumber: string,
    estimatedDelivery: string,
  ): string {
    return `📦 Great news ${customerName}!

Your order #${orderId} has been shipped!

🚚 Tracking Number: ${trackingNumber}
📅 Estimated Delivery: ${estimatedDelivery}

Your beautiful sarees are on their way to you!

Track your package: ${this.baseUrl}/track/${trackingNumber}

- Team Elegance Sarees`
  }

  private async checkIfCartStillAbandoned(customerId: string): Promise<boolean> {
    try {
      // In a real app, you'd check your database
      // For now, we'll assume the cart is still abandoned
      return true
    } catch (error) {
      console.error("Error checking cart status:", error)
      return false
    }
  }
}

// Export singleton instance
export const whatsappCartService = WhatsAppCartNotificationService.getInstance()
