"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { whatsappCartService } from "@/lib/whatsapp-cart-notifications"

interface UseCartWhatsAppOptions {
  customer?: {
    id: string
    name: string
    email: string
    whatsappNumber: string
    whatsappConsent: boolean
  }
  enableAbandonmentReminders?: boolean
  abandonmentDelayMinutes?: number
}

export function useCartWhatsApp(options: UseCartWhatsAppOptions) {
  const { items, total } = useCart()
  const { customer, enableAbandonmentReminders = true, abandonmentDelayMinutes = 60 } = options

  // Send cart update notification when items change
  useEffect(() => {
    if (!customer || !customer.whatsappConsent || items.length === 0) {
      return
    }

    const sendCartUpdate = async () => {
      const cartData = {
        customer,
        cartItems: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        cartTotal: total,
        cartUrl: `${window.location.origin}/cart`,
        abandonedAt: new Date(),
      }

      await whatsappCartService.sendCartUpdateNotification(cartData)
    }

    // Debounce cart updates to avoid spam
    const timeoutId = setTimeout(sendCartUpdate, 2000)
    return () => clearTimeout(timeoutId)
  }, [items, total, customer])

  // Schedule abandonment reminder when cart becomes inactive
  useEffect(() => {
    if (!customer || !customer.whatsappConsent || !enableAbandonmentReminders || items.length === 0) {
      return
    }

    let abandonmentTimer: NodeJS.Timeout

    const scheduleAbandonmentReminder = () => {
      const cartData = {
        customer,
        cartItems: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        cartTotal: total,
        cartUrl: `${window.location.origin}/cart`,
        abandonedAt: new Date(),
      }

      whatsappCartService.scheduleCartAbandonmentReminder(cartData, abandonmentDelayMinutes)
    }

    // Reset timer on any cart activity
    const resetAbandonmentTimer = () => {
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer)
      }
      abandonmentTimer = setTimeout(scheduleAbandonmentReminder, abandonmentDelayMinutes * 60 * 1000)
    }

    resetAbandonmentTimer()

    return () => {
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer)
      }
    }
  }, [items, total, customer, enableAbandonmentReminders, abandonmentDelayMinutes])

  return {
    sendOrderConfirmation: async (orderId: string) => {
      if (customer && customer.whatsappConsent) {
        return await whatsappCartService.sendOrderConfirmation(orderId, customer, total)
      }
      return false
    },
    sendShippingUpdate: async (orderId: string, trackingNumber: string, estimatedDelivery: string) => {
      if (customer && customer.whatsappConsent) {
        return await whatsappCartService.sendShippingUpdate(orderId, customer, trackingNumber, estimatedDelivery)
      }
      return false
    },
  }
}
