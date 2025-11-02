"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalOrders, setTotalOrders] = useState<number>(0)
  const [activeProducts, setActiveProducts] = useState<number>(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: ordersAgg } = await supabase.from("orders").select("total_amount, payment_status").order("created_at", { ascending: false })
        const paid = (ordersAgg || []).filter((o: any) => (o.payment_status || "").toLowerCase() === "verified")
        setTotalRevenue(paid.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0))
        setTotalOrders((ordersAgg || []).length)

        const { count: activeCount } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("active", true)
        setActiveProducts(activeCount || 0)

        const { data: recent } = await supabase
          .from("orders")
          .select("order_number, total_amount, status, created_at, shipping_address")
          .order("created_at", { ascending: false })
          .limit(5)
        setRecentOrders(recent || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Store performance overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading...</div>}
          {!loading && (
            <div className="space-y-4">
              {recentOrders.map((o) => (
                <div key={o.order_number} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-sm text-muted-foreground">{(o.shipping_address as any)?.name || "Customer"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">₹{Number(o.total_amount || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={String(o.status || "").toLowerCase() === "delivered" ? "default" : "outline"}>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="w-full bg-transparent">View All Orders</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
