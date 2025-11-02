"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  size?: string
  color?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) } : item,
        )
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      } else {
        const newItem = { ...action.payload, quantity: action.payload.quantity || 1 }
        const updatedItems = [...state.items, newItem]
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: updatedItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: updatedItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })
  const storageKeyRef = useRef<string>("cart:guest")

  // Load cart from localStorage on mount
  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const loadForKey = (key: string) => {
      const savedCart = localStorage.getItem(key)
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart)
          dispatch({ type: "LOAD_CART", payload: cartItems })
        } catch (error) {
          console.error("Failed to load cart from localStorage:", error)
        }
      } else {
        dispatch({ type: "LOAD_CART", payload: [] })
      }
    }

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const key = user?.id ? `cart:${user.id}` : "cart:guest"
      storageKeyRef.current = key
      if (!mounted) return
      loadForKey(key)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      const prevKey = storageKeyRef.current
      const newKey = session?.user?.id ? `cart:${session.user.id}` : "cart:guest"

      if (prevKey !== newKey) {
        // On login: merge guest cart into user cart
        if (prevKey === "cart:guest" && newKey !== "cart:guest") {
          const guestCartRaw = localStorage.getItem(prevKey)
          const userCartRaw = localStorage.getItem(newKey)
          try {
            const guestItems: any[] = guestCartRaw ? JSON.parse(guestCartRaw) : []
            const userItems: any[] = userCartRaw ? JSON.parse(userCartRaw) : []
            // Merge by id, sum quantities
            const mergedMap = new Map<string, any>()
            for (const it of userItems) mergedMap.set(it.id, it)
            for (const it of guestItems) {
              const existing = mergedMap.get(it.id)
              if (existing) mergedMap.set(it.id, { ...existing, quantity: Number(existing.quantity || 0) + Number(it.quantity || 0) })
              else mergedMap.set(it.id, it)
            }
            const merged = Array.from(mergedMap.values())
            localStorage.setItem(newKey, JSON.stringify(merged))
            localStorage.removeItem(prevKey)
          } catch (e) {
            // If merge fails, prefer user cart
          }
        }

        storageKeyRef.current = newKey
        const savedCart = localStorage.getItem(newKey)
        try {
          const items = savedCart ? JSON.parse(savedCart) : []
          dispatch({ type: "LOAD_CART", payload: items })
        } catch {
          dispatch({ type: "LOAD_CART", payload: [] })
        }
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKeyRef.current, JSON.stringify(state.items))
    // Also sync to server for authenticated users
    const sync = async () => {
      try {
        const items = state.items.map((i) => ({ id: i.id, quantity: i.quantity }))
        await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) })
      } catch { }
    }
    sync()
  }, [state.items])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider value={{ state, dispatch, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
