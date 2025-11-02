import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering - this route uses cookies and auth
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Ensure admin role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        // Get all orders
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select(`
                id,
                user_id,
                total_amount,
                payment_status,
                status,
                created_at,
                order_items (
                    quantity,
                    price,
                    products (
                        id,
                        name,
                        category
                    )
                )
            `)
            .order("created_at", { ascending: false })

        if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 400 })

        // Get all products
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, name, category, price, stock_quantity, active")
            .eq("active", true)

        if (productsError) return NextResponse.json({ error: productsError.message }, { status: 400 })

        // Get all customers
        const { data: customers, error: customersError } = await supabase
            .from("profiles")
            .select("id, created_at")
            .eq("role", "customer")

        if (customersError) return NextResponse.json({ error: customersError.message }, { status: 400 })

        // Calculate metrics
        const paidOrders = (orders || []).filter(o =>
            o.payment_status === "verified" || o.payment_status === "paid"
        )

        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
        const totalOrdersCount = orders?.length || 0

        // Calculate revenue growth (last 3 months vs previous 3 months)
        const now = new Date()
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

        const recentRevenue = paidOrders
            .filter(o => new Date(o.created_at) >= threeMonthsAgo)
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

        const previousRevenue = paidOrders
            .filter(o => {
                const date = new Date(o.created_at)
                return date >= sixMonthsAgo && date < threeMonthsAgo
            })
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

        const revenueGrowth = previousRevenue > 0
            ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
            : "0"

        // Calculate customer retention (customers with more than 1 order)
        const customerOrderCounts: Record<string, number> = {}
        orders?.forEach(order => {
            if (order.order_items && Array.isArray(order.order_items)) {
                // This will be populated from actual order user_id if available
            }
        })

        const uniqueCustomers = new Set(
            orders?.map(o => (o as any).user_id).filter(Boolean) || []
        )
        const repeatCustomers = Array.from(uniqueCustomers).filter((cid: any) => {
            const customerOrders = orders?.filter((o: any) => o.user_id === cid) || []
            return customerOrders.length > 1
        }).length

        const retentionRate = uniqueCustomers.size > 0
            ? ((repeatCustomers / uniqueCustomers.size) * 100).toFixed(1)
            : "0"

        // Sales trend by month (last 6 months)
        const months: string[] = []
        const salesByMonth: Record<string, { sales: number; orders: number; customers: Set<string> }> = {}

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = date.toLocaleString('default', { month: 'short' })
            months.push(monthKey)
            salesByMonth[monthKey] = { sales: 0, orders: 0, customers: new Set() }
        }

        paidOrders.forEach(order => {
            const orderDate = new Date(order.created_at)
            const monthKey = orderDate.toLocaleString('default', { month: 'short' })
            if (salesByMonth[monthKey]) {
                salesByMonth[monthKey].sales += Number(order.total_amount || 0)
                salesByMonth[monthKey].orders += 1
                if ((order as any).user_id) {
                    salesByMonth[monthKey].customers.add((order as any).user_id)
                }
            }
        })

        const salesTrend = months.map(month => ({
            month,
            sales: salesByMonth[month]?.sales || 0,
            orders: salesByMonth[month]?.orders || 0,
            customers: salesByMonth[month]?.customers.size || 0
        }))

        // Category performance
        const categoryRevenue: Record<string, { revenue: number; orders: number }> = {}
        paidOrders.forEach(order => {
            if (order.order_items && Array.isArray(order.order_items)) {
                order.order_items.forEach((item: any) => {
                    const category = item.products?.category || "Uncategorized"
                    if (!categoryRevenue[category]) {
                        categoryRevenue[category] = { revenue: 0, orders: 0 }
                    }
                    categoryRevenue[category].revenue += Number(item.price || 0) * Number(item.quantity || 0)
                })
            }
            // Count unique orders per category
            const orderCategories = new Set()
            if (order.order_items && Array.isArray(order.order_items)) {
                order.order_items.forEach((item: any) => {
                    if (item.products?.category) {
                        orderCategories.add(item.products.category)
                    }
                })
            }
            orderCategories.forEach((cat: any) => {
                if (!categoryRevenue[cat]) {
                    categoryRevenue[cat] = { revenue: 0, orders: 0 }
                }
                categoryRevenue[cat].orders += 1
            })
        })

        const categoryPerformance = Object.entries(categoryRevenue)
            .map(([name, data]) => ({
                name,
                revenue: data.revenue,
                orders: data.orders,
                color: getCategoryColor(name)
            }))
            .sort((a, b) => b.revenue - a.revenue)

        // Top products by revenue
        const productRevenue: Record<string, { name: string; sales: number; revenue: number }> = {}
        paidOrders.forEach(order => {
            if (order.order_items && Array.isArray(order.order_items)) {
                order.order_items.forEach((item: any) => {
                    const productId = item.products?.id || "unknown"
                    const productName = item.products?.name || "Unknown Product"
                    if (!productRevenue[productId]) {
                        productRevenue[productId] = { name: productName, sales: 0, revenue: 0 }
                    }
                    productRevenue[productId].sales += Number(item.quantity || 0)
                    productRevenue[productId].revenue += Number(item.price || 0) * Number(item.quantity || 0)
                })
            }
        })

        const topProducts = Object.values(productRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Inventory alerts (low stock products)
        const inventoryAlerts = (products || [])
            .filter(p => p.stock_quantity !== null && p.stock_quantity !== undefined)
            .map(p => ({
                id: p.id,
                name: p.name,
                stock: p.stock_quantity || 0,
                status: p.stock_quantity! <= 5 ? "low" : p.stock_quantity! <= 15 ? "medium" : "good"
            }))
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5)

        // Conversion rate (orders / unique customers)
        const uniqueOrderCustomers = new Set(
            orders?.map((o: any) => o.user_id).filter(Boolean) || []
        )
        const totalCustomers = customers?.length || 1
        const conversionRate = totalCustomers > 0
            ? ((uniqueOrderCustomers.size / totalCustomers) * 100).toFixed(1)
            : "0"

        return NextResponse.json({
            revenueGrowth: `+${revenueGrowth}%`,
            retentionRate: `${retentionRate}%`,
            conversionRate: `${conversionRate}%`,
            salesTrend,
            categoryPerformance,
            topProducts,
            inventoryAlerts,
            totalRevenue,
            totalOrders: totalOrdersCount,
            totalCustomers: customers?.length || 0,
        })
    } catch (e: any) {
        console.error("Analytics error:", e)
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        "Silk Sarees": "#8B5CF6",
        "Cotton Sarees": "#06B6D4",
        "Designer Sarees": "#F59E0B",
        "Bridal Sarees": "#EF4444",
        "Festive Wear": "#10B981",
        "Casual Sarees": "#6366F1",
    }
    return colors[category] || "#8B5CF6"
}

