"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type OrderItem = {
  id: string
  product_id: string
  quantity: number
  price: number
}

type Product = {
  id: string
  name: string
  images: string[] | null
}

type Order = {
  id: string
  order_number: string
  status: string
  total_amount: number
  shipping_address: any
  created_at: string
}

export function OrderHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [itemsByOrderId, setItemsByOrderId] = useState<Record<string, Array<OrderItem & { product?: Product }>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: userRes } = await supabase.auth.getUser()
        const authUser = userRes.user
        if (!authUser) {
          setOrders([])
          setItemsByOrderId({})
          setLoading(false)
          return
        }

        const { data: userOrders, error: ordersErr } = await supabase
          .from("orders")
          .select("id, order_number, status, total_amount, shipping_address, created_at")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })

        if (ordersErr) throw ordersErr

        setOrders(userOrders || [])

        if (!userOrders || userOrders.length === 0) {
          setItemsByOrderId({})
          setLoading(false)
          return
        }

        const orderIds = userOrders.map((o) => o.id)
        const { data: allItems, error: itemsErr } = await supabase
          .from("order_items")
          .select("id, order_id, product_id, quantity, price")
          .in("order_id", orderIds)

        if (itemsErr) throw itemsErr

        const productIds = Array.from(new Set((allItems || []).map((i) => i.product_id).filter(Boolean))) as string[]
        let productsMap: Record<string, Product> = {}
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("id, name, images")
            .in("id", productIds)
          for (const p of products || []) {
            productsMap[p.id] = p as Product
          }
        }

        const grouped: Record<string, Array<OrderItem & { product?: Product }>> = {}
        for (const item of allItems || []) {
          const withProduct = { ...item, product: productsMap[item.product_id] }
          if (!grouped[item.order_id]) grouped[item.order_id] = []
          grouped[item.order_id].push(withProduct)
        }

        setItemsByOrderId(grouped)
      } catch (e: any) {
        setError(e?.message ?? "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const items = itemsByOrderId[order.id] || []
      const itemNameMatch = items.some((i) => (i.product?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || itemNameMatch
      const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [orders, itemsByOrderId, searchQuery, statusFilter])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default"
      case "shipped":
        return "secondary"
      case "processing":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(itemsByOrderId[order.id] || []).map((item) => {
                  const image = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"
                  const name = item.product?.name ?? "Product"
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={image}
                        alt={name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Shipping Address</p>
                      <p className="text-sm">{typeof order.shipping_address === "string" ? order.shipping_address : JSON.stringify(order.shipping_address)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status.toLowerCase() === "delivered" && <Button size="sm">Reorder</Button>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!loading && filteredOrders.length === 0) && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No orders found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
