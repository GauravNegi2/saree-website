"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react"

const mockWishlistItems = [
  {
    id: "1",
    name: "Royal Silk Saree",
    price: 12999,
    originalPrice: 15999,
    image: "/luxurious-royal-blue-silk-saree-with-gold-border-p.jpg",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isNew: false,
    isSale: true,
  },
  {
    id: "2",
    name: "Handwoven Banarasi",
    price: 18999,
    image: "/traditional-banarasi-saree-with-intricate-weaving-.jpg",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    isNew: true,
    isSale: false,
  },
  {
    id: "3",
    name: "Embroidered Net Saree",
    price: 9999,
    image: "/delicate-net-saree-with-thread-embroidery-elegant.jpg",
    rating: 4.8,
    reviews: 78,
    inStock: false,
    isNew: true,
    isSale: false,
  },
]

export function WishlistView() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)

  const handleRemoveFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddToCart = (id: string) => {
    // Add to cart logic here
    console.log("Added to cart:", id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">My Wishlist</h2>
        <p className="text-muted-foreground">{wishlistItems.length} items</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.isNew && (
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">New</Badge>
                )}
                {item.isSale && (
                  <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">Sale</Badge>
                )}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="outline" className="bg-white text-black">
                      Out of Stock
                    </Badge>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-balance">{item.name}</h3>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{item.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({item.reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-primary">₹{item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!item.inStock} onClick={() => handleAddToCart(item.id)}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {item.inStock ? "Add to Cart" : "Notify Me"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Save items you love to your wishlist and shop them later</p>
          <Button asChild>
            <a href="/collections">Start Shopping</a>
          </Button>
        </div>
      )}
    </div>
  )
}
