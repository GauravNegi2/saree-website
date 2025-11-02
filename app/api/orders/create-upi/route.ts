import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const Schema = z.object({
            orderNumber: z.string().min(3),
            amount: z.number().nonnegative(),
            shippingAddress: z.any(),
            items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
        })
        const parsed = Schema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        const { orderNumber, amount, shippingAddress, items } = parsed.data as {
            orderNumber: string
            amount: number
            shippingAddress: any
            items: Array<{ product_id: string; quantity: number; price: number }>
        }

        if (!orderNumber || !amount || !shippingAddress || !Array.isArray(items)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Recompute authoritative total and validate products
        const productIds = items.map((i) => i.product_id)
        const { data: products, error: prodErr } = await supabase
            .from("products")
            .select("id, price, stock_quantity, active")
            .in("id", productIds)
        if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 })
        const priceById = new Map<string, { price: number; stock: number; active: boolean | null }>()
        for (const p of products || []) priceById.set((p as any).id, { price: Number((p as any).price || 0), stock: Number((p as any).stock_quantity || 0), active: Boolean((p as any).active) })

        let computedTotal = 0
        for (const it of items) {
            const p = priceById.get(it.product_id)
            if (!p || !p.active) return NextResponse.json({ error: "One or more products unavailable" }, { status: 400 })
            if (p.stock !== 0 && it.quantity > p.stock) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
            computedTotal += p.price * it.quantity
        }

        // Optional shipping fee rule
        const shippingFee = computedTotal >= 999 ? 0 : (items.length > 0 ? 99 : 0)
        const finalAmount = computedTotal + shippingFee

        // Insert order
        const { data: order, error: orderErr } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                order_number: orderNumber,
                status: "pending",
                payment_status: "pending",
                payment_method: "UPI_QR",
                total_amount: finalAmount,
                shipping_address: shippingAddress,
            })
            .select("id")
            .single()

        if (orderErr) {
            return NextResponse.json({ error: orderErr.message }, { status: 400 })
        }

        // Insert order items
        if (items.length > 0) {
            const insertItems = items.map((it) => ({ order_id: order!.id, product_id: it.product_id, quantity: it.quantity, price: it.price }))
            const { error: itemsErr } = await supabase.from("order_items").insert(insertItems)
            if (itemsErr) {
                return NextResponse.json({ error: itemsErr.message }, { status: 400 })
            }
        }

        // Send order confirmation email with invoice
        try {
            const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single()
            if (profile?.email) {
                await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/email/order-confirmation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: order!.id,
                        orderNumber,
                        amount: finalAmount,
                        customerEmail: profile.email,
                        customerName: profile.full_name || "",
                        items,
                    }),
                })
            }
        } catch (e) {
            // Non-blocking
        }

        return NextResponse.json({ success: true, orderId: order!.id, amount: finalAmount })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


