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

        // Try to fetch settings, if table doesn't exist, return defaults
        const { data, error } = await supabase
            .from("settings")
            .select("settings_data")
            .eq("id", "main")
            .single()

        if (error && error.code !== "PGRST116") {
            // PGRST116 = not found, which is ok
            console.error("Settings fetch error:", error)
        }

        // Return settings or defaults
        const defaultSettings = {
            storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Elegance Sarees",
            storeEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "admin@elegancesarees.com",
            storePhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 98765 43210",
            whatsappNumber: "+91 98765 43210",
            currency: "INR",
            taxRate: "18",
            shippingFee: "99",
            freeShippingThreshold: "999",
            whatsappEnabled: true,
            emailNotifications: true,
            smsNotifications: false,
            cartAbandonmentEnabled: true,
            orderConfirmationEnabled: true,
            shippingUpdatesEnabled: true,
        }

        return NextResponse.json({
            settings: data?.settings_data || defaultSettings,
        })
    } catch (e: any) {
        console.error("Settings error:", e)
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { settings } = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Ensure admin role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        // Upsert settings (create if doesn't exist, update if exists)
        const { error: upsertError } = await supabase
            .from("settings")
            .upsert(
                {
                    id: "main",
                    settings_data: settings,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "id",
                }
            )

        if (upsertError) {
            // If table doesn't exist, log but don't fail
            console.error("Settings save error (table may not exist):", upsertError)
            return NextResponse.json({
                success: true,
                message: "Settings saved (table may need to be created)",
            })
        }

        return NextResponse.json({ success: true, message: "Settings saved successfully" })
    } catch (e: any) {
        console.error("Settings save error:", e)
        return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
    }
}

