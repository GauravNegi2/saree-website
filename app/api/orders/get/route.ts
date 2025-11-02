import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: order, error } = await supabase
            .from("orders")
            .select("id, order_number, total_amount, payment_status, status, shipping_address, upi_transaction_id, payment_screenshot_url")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()
        if (error) return NextResponse.json({ error: error.message }, { status: 404 })

        const { data: items } = await supabase
            .from("order_items")
            .select("id, product_id, quantity, price")
            .eq("order_id", id)

        let products: Record<string, any> = {}
        const productIds = Array.from(new Set((items || []).map((i) => i.product_id)))
        if (productIds.length > 0) {
            const { data: prods } = await supabase.from("products").select("id, name").in("id", productIds)
            for (const p of prods || []) products[p.id] = p
        }

        const withProducts = (items || []).map((it) => ({ ...it, product: products[it.product_id] }))

        return NextResponse.json({ order: { ...order, items: withProducts } })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


