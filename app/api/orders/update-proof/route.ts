import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { id, upi_transaction_id, payment_screenshot_url } = await request.json()
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Ensure order belongs to the user
        const { data: order } = await supabase.from("orders").select("id").eq("id", id).eq("user_id", user.id).single()
        if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const { error } = await supabase
            .from("orders")
            .update({ upi_transaction_id, payment_screenshot_url })
            .eq("id", id)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


