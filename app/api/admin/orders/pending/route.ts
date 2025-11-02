import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Ensure admin role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { data, error } = await supabase
            .from("orders")
            .select(`
                id, 
                order_number, 
                total_amount, 
                created_at, 
                payment_status, 
                payment_method, 
                shipping_address, 
                payment_screenshot_url,
                upi_transaction_id,
                user_id,
                profiles:user_id (
                    id,
                    full_name,
                    email,
                    phone
                )
            `)
            .eq("payment_status", "pending")
            .order("created_at", { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({ orders: data })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


