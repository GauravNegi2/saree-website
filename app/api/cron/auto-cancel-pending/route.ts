import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { whatsappService } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization") || ""
        const token = authHeader.replace(/^Bearer\s+/i, "")
        if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = await createClient()

        const cutoffIso = new Date(Date.now() - 30 * 60 * 1000).toISOString()
        const { data: pending, error } = await supabase
            .from("orders")
            .select("id, order_number, total_amount, shipping_address")
            .eq("payment_status", "pending")
            .lte("created_at", cutoffIso)

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        let cancelled = 0
        for (const o of pending || []) {
            const { error: updErr } = await supabase
                .from("orders")
                .update({ payment_status: "failed", status: "cancelled", updated_at: new Date().toISOString() })
                .eq("id", o.id)
            if (!updErr) {
                cancelled++
                // Notify via WhatsApp if number present
                const phone = (o as any).shipping_address?.phone as string | undefined
                const name = (o as any).shipping_address?.name as string | undefined
                if (phone) {
                    try {
                        await whatsappService.sendCartNotification(phone, name || "Customer", [])
                    } catch { }
                }
            }
        }

        return NextResponse.json({ success: true, cancelled })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}


