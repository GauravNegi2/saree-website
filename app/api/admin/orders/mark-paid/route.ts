import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { id, upi_transaction_id } = await request.json()
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        // Get order and customer details before updating
        const { data: orderData } = await supabase
            .from("orders")
            .select("order_number, total_amount, user_id, profiles ( email, full_name )")
            .eq("id", id)
            .single()

        const { error } = await supabase
            .from("orders")
            .update({ payment_status: "verified", status: "confirmed", upi_transaction_id, verified_by: user.id, updated_at: new Date().toISOString() })
            .eq("id", id)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        // Send payment confirmation email
        if (orderData && (orderData as any).profiles?.email) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/email/payment-verified`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderNumber: (orderData as any).order_number,
                        amount: (orderData as any).total_amount,
                        customerEmail: (orderData as any).profiles.email,
                        customerName: (orderData as any).profiles.full_name || "",
                    }),
                })
            } catch (e) {
                // Non-blocking
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


