import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// GET current user's cart items
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ items: [] })

    const { data, error } = await supabase
        .from("cart_items")
        .select("product_id, quantity, products ( id, name, price, images )")
        .eq("user_id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const items = (data || []).map((row: any) => ({
        id: row.product_id,
        name: row.products?.name || "Product",
        price: Number(row.products?.price || 0),
        image: (row.products?.images && row.products.images[0]) || "/placeholder.svg",
        quantity: row.quantity,
    }))
    return NextResponse.json({ items })
}

// POST sync: replace cart with provided items
export async function POST(request: NextRequest) {
    const body = await request.json()
    const Schema = z.object({ items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().positive() })).default([]) })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    const { items } = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Fetch current items
    const { data: existing } = await supabase
        .from("cart_items")
        .select("product_id")
        .eq("user_id", user.id)

    const existingIds = new Set((existing || []).map((r: any) => r.product_id))
    const incomingIds = new Set(items.map((i) => i.id))

    // Upsert incoming
    if (items.length > 0) {
        const upserts = items.map((i) => ({ user_id: user.id, product_id: i.id, quantity: i.quantity }))
        const { error: upErr } = await supabase.from("cart_items").upsert(upserts, { onConflict: "user_id,product_id" })
        if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    // Delete removed
    const toDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id))
    if (toDelete.length > 0) {
        const { error: delErr } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", user.id)
            .in("product_id", toDelete)
        if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
}


