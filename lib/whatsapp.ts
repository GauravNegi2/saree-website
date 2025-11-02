// WhatsApp Business API integration
interface WhatsAppMessage {
  to: string
  type: "template" | "text"
  template?: {
    name: string
    language: {
      code: string
    }
    components: Array<{
      type: string
      parameters: Array<{
        type: string
        text: string
      }>
    }>
  }
  text?: {
    body: string
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
}

class WhatsAppService {
  private config: WhatsAppConfig
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("WhatsApp API Error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("WhatsApp Service Error:", error)
      return false
    }
  }

  async sendCartAbandonmentReminder(
    phoneNumber: string,
    customerName: string,
    cartItems: CartItem[],
    cartTotal: number,
  ): Promise<boolean> {
    const itemsList = cartItems.map((item) => `${item.name} (₹${item.price} x ${item.quantity})`).join("\n")

    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "cart_abandonment_reminder",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: customerName },
              { type: "text", text: itemsList },
              { type: "text", text: `₹${cartTotal.toLocaleString()}` },
            ],
          },
        ],
      },
    }

    return await this.sendMessage(message)
  }

  async sendOrderConfirmation(
    phoneNumber: string,
    customerName: string,
    orderId: string,
    orderTotal: number,
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "order_confirmation",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: customerName },
              { type: "text", text: orderId },
              { type: "text", text: `₹${orderTotal.toLocaleString()}` },
            ],
          },
        ],
      },
    }

    return await this.sendMessage(message)
  }

  async sendCartNotification(phoneNumber: string, customerName: string, cartItems: CartItem[]): Promise<boolean> {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "text",
      text: {
        body: `Hi ${customerName}! 🛍️\n\nYou have ${itemCount} item(s) in your cart worth ₹${cartTotal.toLocaleString()}.\n\nComplete your purchase now to secure these beautiful sarees!\n\n🌟 Free shipping on orders above ₹1999\n💝 Easy returns within 7 days\n\nShop now: ${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      },
    }

    return await this.sendMessage(message)
  }

  async sendWelcomeMessage(phoneNumber: string, customerName: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "welcome_message",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: customerName }],
          },
        ],
      },
    }

    return await this.sendMessage(message)
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "")

    // Add country code if not present
    if (cleaned.length === 10) {
      return `91${cleaned}` // India country code
    }

    return cleaned
  }
}

export const whatsappService = new WhatsAppService()
