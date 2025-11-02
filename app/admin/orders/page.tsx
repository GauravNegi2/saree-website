"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@supabase/ssr"
import { Search, MoreHorizontal, Eye, Truck, MessageCircle, Download, Package, User, MapPin } from "lucide-react"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: {
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  shipping_address: any
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  profiles: {
    full_name: string
    email: string
    phone: string
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState("")
  const [statusNote, setStatusNote] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          ),
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              images
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
      setFilteredOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterOrders(term, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterOrders(searchTerm, status)
  }

  const filterOrders = (search: string, status: string) => {
    let filtered = orders

    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          order.profiles?.email?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async () => {
    if (!selectedOrder || !statusUpdate) return

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: statusUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id)

      if (error) throw error

      // Refresh orders
      await fetchOrders()
      setSelectedOrder(null)
      setStatusUpdate("")
      setStatusNote("")
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      processing: { variant: "default" as const, label: "Processing" },
      shipped: { variant: "outline" as const, label: "Shipped" },
      delivered: { variant: "default" as const, label: "Delivered" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase()
    const paid = s === "verified" || s === "paid"
    return <Badge variant={paid ? "default" : "destructive"}>{paid ? "Paid" : "Pending"}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Track and manage all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{order.profiles?.email || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>₹{order.total_amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setSelectedOrder(order)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                                <DialogDescription>Complete order information and management</DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Customer Information */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <Label className="font-semibold">Customer</Label>
                                      </div>
                                      <div>
                                        <p className="font-medium">{selectedOrder.profiles?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.profiles?.email}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.profiles?.phone}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <Label className="font-semibold">Shipping Address</Label>
                                      </div>
                                      <div className="text-sm">
                                        {selectedOrder.shipping_address ? (
                                          <div>
                                            <p>{selectedOrder.shipping_address.street}</p>
                                            <p>
                                              {selectedOrder.shipping_address.city},{" "}
                                              {selectedOrder.shipping_address.state}
                                            </p>
                                            <p>{selectedOrder.shipping_address.pincode}</p>
                                          </div>
                                        ) : (
                                          <p className="text-muted-foreground">No address provided</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4" />
                                      <Label className="font-semibold">Order Items</Label>
                                    </div>
                                    <div className="border rounded-lg p-4 space-y-3">
                                      {selectedOrder.order_items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                              <Package className="h-6 w-6" />
                                            </div>
                                            <div>
                                              <p className="font-medium">{item.product?.name || "Product"}</p>
                                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                          </div>
                                          <p className="font-medium">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Order Status Update */}
                                  <div className="space-y-4">
                                    <Label className="font-semibold">Update Order Status</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="status">New Status</Label>
                                        <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor="note">Status Note (Optional)</Label>
                                        <Textarea
                                          id="note"
                                          placeholder="Add a note about this status change..."
                                          value={statusNote}
                                          onChange={(e) => setStatusNote(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <Button onClick={updateOrderStatus} disabled={!statusUpdate}>
                                      Update Status
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Send WhatsApp
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
