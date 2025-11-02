// Cart abandonment tracking and notification system
interface CartSession {
  userId?: string
  sessionId: string
  phoneNumber?: string
  customerName?: string
  cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  lastUpdated: Date
  remindersSent: number
  isAbandoned: boolean
}

class CartTrackingService {
  private sessions: Map<string, CartSession> = new Map()
  private abandonmentThreshold = 30 * 60 * 1000 // 30 minutes
  private maxReminders = 3

  constructor() {
    // Start the abandonment checker
    this.startAbandonmentChecker()
  }

  trackCartUpdate(
    sessionId: string,
    cartItems: any[],
    userInfo?: { phoneNumber?: string; name?: string; userId?: string },
  ) {
    const session: CartSession = {
      sessionId,
      userId: userInfo?.userId,
      phoneNumber: userInfo?.phoneNumber,
      customerName: userInfo?.name,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      lastUpdated: new Date(),
      remindersSent: 0,
      isAbandoned: false,
    }

    this.sessions.set(sessionId, session)

    // Send immediate cart notification if user has WhatsApp consent
    if (session.phoneNumber && session.customerName && cartItems.length > 0) {
      this.sendCartNotification(session)
    }
  }

  async sendCartNotification(session: CartSession) {
    if (!session.phoneNumber || !session.customerName) return

    try {
      const { whatsappService } = await import("./whatsapp")
      await whatsappService.sendCartNotification(session.phoneNumber, session.customerName, session.cartItems)
    } catch (error) {
      console.error("Failed to send cart notification:", error)
    }
  }

  async sendAbandonmentReminder(session: CartSession) {
    if (!session.phoneNumber || !session.customerName || session.remindersSent >= this.maxReminders) {
      return
    }

    try {
      const { whatsappService } = await import("./whatsapp")
      const cartTotal = session.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      const success = await whatsappService.sendCartAbandonmentReminder(
        session.phoneNumber,
        session.customerName,
        session.cartItems,
        cartTotal,
      )

      if (success) {
        session.remindersSent++
        this.sessions.set(session.sessionId, session)
      }
    } catch (error) {
      console.error("Failed to send abandonment reminder:", error)
    }
  }

  markCartAsCompleted(sessionId: string) {
    this.sessions.delete(sessionId)
  }

  private startAbandonmentChecker() {
    setInterval(
      () => {
        const now = new Date()

        for (const [sessionId, session] of this.sessions.entries()) {
          const timeSinceUpdate = now.getTime() - session.lastUpdated.getTime()

          if (timeSinceUpdate > this.abandonmentThreshold && !session.isAbandoned && session.cartItems.length > 0) {
            session.isAbandoned = true
            this.sessions.set(sessionId, session)

            // Send abandonment reminder
            this.sendAbandonmentReminder(session)
          }

          // Clean up old sessions (older than 24 hours)
          if (timeSinceUpdate > 24 * 60 * 60 * 1000) {
            this.sessions.delete(sessionId)
          }
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes
  }

  getAbandonedCarts(): CartSession[] {
    return Array.from(this.sessions.values()).filter((session) => session.isAbandoned)
  }

  getActiveCartSessions(): CartSession[] {
    return Array.from(this.sessions.values()).filter((session) => !session.isAbandoned && session.cartItems.length > 0)
  }
}

export const cartTrackingService = new CartTrackingService()
