"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Users, ShoppingCart, MessageCircle } from "lucide-react"

interface AnalyticsData {
  revenueGrowth: string
  retentionRate: string
  conversionRate: string
  salesTrend: Array<{ month: string; sales: number; orders: number; customers: number }>
  categoryPerformance: Array<{ name: string; revenue: number; orders: number; color: string }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  inventoryAlerts: Array<{ id: string; name: string; stock: number; status: string }>
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/analytics")
        const json = await res.json()
        if (res.ok) {
          setData(json)
        }
      } catch (e) {
        console.error("Failed to load analytics:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your business performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.revenueGrowth}</div>
                <p className="text-xs text-muted-foreground">vs last quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.retentionRate}</div>
                <p className="text-xs text-muted-foreground">repeat customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{data.conversionRate}</div>
                <p className="text-xs text-muted-foreground">customers who made orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <MessageCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">registered customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Performance Trend</CardTitle>
              <CardDescription>Sales, orders, and customer acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#06B6D4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                {data.categoryPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.categoryPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No category data available yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best sellers by units and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {data.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No product sales data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Campaign Performance</CardTitle>
              <CardDescription>Message delivery and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-12">
                WhatsApp analytics will be available once message tracking is implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Views vs Sales</CardTitle>
                <CardDescription>Conversion tracking by product</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {data.topProducts.map((product, index) => {
                      const maxSales = Math.max(...data.topProducts.map(p => p.sales), 1)
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{product.name}</span>
                            <span>{product.sales} units</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(product.sales / maxSales) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No product sales data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Products requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {data.inventoryAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {data.inventoryAlerts.map((product) => {
                      const isLow = product.status === "low"
                      const isMedium = product.status === "medium"
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${isLow
                              ? "border-red-200 bg-red-50"
                              : isMedium
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-gray-200"
                            }`}
                        >
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p
                              className={`text-xs ${isLow ? "text-red-600" : isMedium ? "text-yellow-600" : "text-muted-foreground"
                                }`}
                            >
                              {product.stock} units {isLow ? "left" : "remaining"}
                            </p>
                          </div>
                          <div
                            className={`font-bold ${isLow ? "text-red-600" : isMedium ? "text-yellow-600" : "text-green-600"
                              }`}
                          >
                            {isLow ? "Low Stock" : isMedium ? "Medium Stock" : "In Stock"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No inventory alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
