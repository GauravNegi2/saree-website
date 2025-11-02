import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const orderId = request.nextUrl.searchParams.get("orderId")
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const path = `proofs/${user.id}/${orderId}-${Date.now()}.jpg`
    const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: true,
    })
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 400 })

    const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
}


