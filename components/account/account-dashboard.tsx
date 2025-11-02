"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProfileSettings } from "./profile-settings"
import { OrderHistory } from "./order-history"
import { AddressBook } from "./address-book"
import { WishlistView } from "./wishlist-view"
import { Package, MapPin, Heart, Settings, LogOut } from "lucide-react"

interface AccountUser {
  id: string
  email: string
  name: string
}

export function AccountDashboard() {
  const [user, setUser] = useState<AccountUser | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<{ totalOrders: number; totalSpent: number } | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; order_number: string; created_at: string; status: string; amount: number; itemsSummary: string }>>([])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!isMounted) return
      if (authUser) {
        const fullName = (authUser.user_metadata as any)?.full_name as string | undefined
        setUser({
          id: authUser.id,
          email: authUser.email ?? "",
          name: fullName && fullName.trim().length > 0 ? fullName : authUser.email ?? "User",
        })

        // Load account stats and recent orders
        try {
          const { data: orders, error: ordersErr } = await supabase
            .from("orders")
            .select("id, order_number, status, total_amount, created_at")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false })
            .limit(3)

          if (!ordersErr) {
            const totalOrders = orders?.length ?? 0
            const totalSpent = (orders ?? []).reduce((sum, o: any) => sum + Number(o.total_amount || 0), 0)
            setStats({ totalOrders, totalSpent })

            // Optional: fetch brief item summaries for recent orders
            const orderIds = (orders ?? []).map((o: any) => o.id)
            let itemsSummaryByOrder: Record<string, string> = {}
            if (orderIds.length > 0) {
              const { data: items } = await supabase
                .from("order_items")
                .select("order_id, product_id, quantity")
                .in("order_id", orderIds)

              const productIds = Array.from(new Set((items ?? []).map((i: any) => i.product_id).filter(Boolean))) as string[]
              let productNames: Record<string, string> = {}
              if (productIds.length > 0) {
                const { data: products } = await supabase
                  .from("products")
                  .select("id, name")
                  .in("id", productIds)
                for (const p of products || []) productNames[(p as any).id] = (p as any).name
              }

              const grouped: Record<string, Array<{ name: string; quantity: number }>> = {}
              for (const it of items || []) {
                const name = productNames[(it as any).product_id] || "Product"
                if (!grouped[(it as any).order_id]) grouped[(it as any).order_id] = []
                grouped[(it as any).order_id].push({ name, quantity: (it as any).quantity })
              }
              for (const [oid, arr] of Object.entries(grouped)) {
                const parts = arr.slice(0, 2).map((a) => `${a.name}${a.quantity > 1 ? ` x${a.quantity}` : ""}`)
                const more = arr.length > 2 ? ` +${arr.length - 2} more` : ""
                itemsSummaryByOrder[oid] = parts.join(", ") + more
              }
            }

            setRecentOrders(
              (orders ?? []).map((o: any) => ({
                id: o.id,
                order_number: o.order_number,
                created_at: o.created_at,
                status: o.status,
                amount: Number(o.total_amount || 0),
                itemsSummary: itemsSummaryByOrder[o.id] || "",
              }))
            )
          }
        } catch (_e) {
          // Non-fatal for dashboard
        }
      } else {
        setUser(null)
        setStats(null)
        setRecentOrders([])
      }
    }

    loadUser()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">Please sign in to access your account</p>
        <Button asChild>
          <a href="/auth/login">Sign In</a>
        </Button>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders ?? 0}</div>
                <p className="text-xs text-muted-foreground">Your order count</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Wishlist coming soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Number(stats?.totalSpent ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Lifetime spend</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 && (
                  <div className="text-sm text-muted-foreground">No recent orders</div>
                )}
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.itemsSummary}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{Number(order.amount).toLocaleString()}</p>
                      <Badge
                        variant={
                          order.status.toLowerCase() === "delivered"
                            ? "default"
                            : order.status.toLowerCase() === "shipped"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressBook />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistView />
        </TabsContent>

        <TabsContent value="settings">
          <ProfileSettings user={user} onUserUpdate={setUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
