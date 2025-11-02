"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"

interface UserInfo {
  phoneNumber?: string
  name?: string
  userId?: string
  whatsappConsent?: boolean
}

export function useWhatsAppTracking(userInfo?: UserInfo) {
  const { state } = useCart()

  useEffect(() => {
    // Only track if user has given WhatsApp consent
    if (!userInfo?.whatsappConsent || !userInfo.phoneNumber) {
      return
    }

    const sessionId = localStorage.getItem("sessionId") || generateSessionId()
    localStorage.setItem("sessionId", sessionId)

    // Notify backend about cart changes
    const notifyCartUpdate = async () => {
      try {
        await fetch("/api/cart/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            cartItems: state.items,
            userInfo: {
              phoneNumber: userInfo.phoneNumber,
              name: userInfo.name,
              userId: userInfo.userId,
            },
          }),
        })
      } catch (error) {
        console.error("Failed to notify cart update:", error)
      }
    }

    // Debounce cart updates to avoid too many notifications
    const timeoutId = setTimeout(notifyCartUpdate, 2000)

    return () => clearTimeout(timeoutId)
  }, [state.items, userInfo])
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
