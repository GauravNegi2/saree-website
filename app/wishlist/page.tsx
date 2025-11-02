"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Header } from "@/components/header"

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const { dispatch } = useCart()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" })
        const data = await res.json()
        setWishlistItems(data.items || [])
      } catch {
        setWishlistItems([])
      }
    }
    load()
  }, [])

  const removeFromWishlist = async (itemId: string) => {
    await fetch(`/api/wishlist?productId=${encodeURIComponent(itemId)}`, { method: "DELETE" })
    setWishlistItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const addToCart = (item: WishlistItem) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        size: "Free Size",
        color: "Default",
      },
    })
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">My Wishlist</h1>

          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite sarees to your wishlist and shop them later</p>
            <Button asChild>
              <Link href="/collections">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground">My Wishlist</h1>
          <Badge variant="secondary">{wishlistItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-2 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold text-foreground">₹{item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <Button className="w-full" onClick={() => addToCart(item)} disabled={!item.inStock}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {item.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
