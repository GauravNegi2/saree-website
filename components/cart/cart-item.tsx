"use client"

import { useCart, type CartItem as CartItemType } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Heart } from "lucide-react"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: string) => {
    updateQuantity(item.id, Number.parseInt(newQuantity))
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-24 h-32 flex-shrink-0">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.color && (
                  <Badge variant="outline" className="mt-1 capitalize">
                    {item.color}
                  </Badge>
                )}
                {item.size && (
                  <Badge variant="outline" className="mt-1 ml-2">
                    Size: {item.size}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">₹{item.price.toLocaleString()}</div>
                {item.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    ₹{item.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Qty:</span>
                  <Select value={item.quantity.toString()} onValueChange={handleQuantityChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Save for Later
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
