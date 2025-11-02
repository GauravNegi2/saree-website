import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// GET /api/wishlist -> list wishlist items for current user (joined with products)
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: rows, error } = await supabase
        .from("wishlists")
        .select("product_id, products ( id, name, price, original_price, category, images )")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const items = (rows || []).map((r: any) => {
        const p = r.products
        return {
            id: p.id,
            name: p.name,
            price: Number(p.price || 0),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            category: p.category,
            image: (p.images && p.images[0]) || "/placeholder.svg",
            inStock: true,
        }
    })
    return NextResponse.json({ items })
}

// POST /api/wishlist { productId }
export async function POST(request: NextRequest) {
    const body = await request.json()
    const Schema = z.object({ productId: z.string().uuid() })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid productId" }, { status: 400 })
    const { productId } = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // upsert to avoid duplicates
    const { error } = await supabase
        .from("wishlists")
        .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}

// DELETE /api/wishlist?productId=...
export async function DELETE(request: NextRequest) {
    const productId = request.nextUrl.searchParams.get("productId")
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}


