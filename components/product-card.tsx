"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { Heart, ShoppingBag, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  isNew?: boolean
  isSale?: boolean
  rating?: number
  reviews?: number
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
      })
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Optionally preload wishlist state by calling /api/wishlist on mount of a grid
  }, [])

  const handleWishlist = async () => {
    try {
      if (!isWishlisted) {
        await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) })
        setIsWishlisted(true)
      } else {
        await fetch(`/api/wishlist?productId=${encodeURIComponent(product.id)}`, { method: "DELETE" })
        setIsWishlisted(false)
      }
    } catch (e) {
      // ignore
    }
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Card className={cn("group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">New</Badge>}
            {product.isSale && discountPercentage > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white">-{discountPercentage}%</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={handleWishlist}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white" asChild>
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-primary/90 hover:bg-primary text-white"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</div>
            <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/products/${product.id}`}>{product.name}</Link>
            </h3>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
                <span>({product.reviews || 0})</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
