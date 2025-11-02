"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type AdminOrder = {
    id: string
    order_number: string
    total_amount: number
    created_at: string
    payment_status: string
    payment_method: string
    shipping_address: { name?: string; phone?: string; email?: string } | null
    payment_screenshot_url?: string | null
    upi_transaction_id?: string | null
    profiles?: {
        id: string
        full_name: string | null
        email: string | null
        phone: string | null
    } | null
}

export default function AdminVerifyPaymentsPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState<string | null>(null)
    const [txnIds, setTxnIds] = useState<Record<string, string>>({})

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/admin/orders/pending")
                const data = await res.json()
                setOrders(data.orders || [])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return orders
        return orders.filter((o) =>
            o.order_number.toLowerCase().includes(q) ||
            (o.shipping_address?.name || "").toLowerCase().includes(q) ||
            (o.shipping_address?.phone || "").toLowerCase().includes(q)
        )
    }, [orders, search])

    const markPaid = async (id: string) => {
        setMarking(id)
        try {
            const res = await fetch("/api/admin/orders/mark-paid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, upi_transaction_id: txnIds[id] || undefined }),
            })
            if (res.ok) {
                setOrders((prev) => prev.filter((o) => o.id !== id))
            }
        } finally {
            setMarking(null)
        }
    }

    const cancelOrder = async (id: string) => {
        setMarking(id)
        try {
            const res = await fetch("/api/admin/orders/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
            if (res.ok) {
                setOrders((prev) => prev.filter((o) => o.id !== id))
            }
        } finally {
            setMarking(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Verify Payments</h1>
                <div className="w-72">
                    <Input placeholder="Search by order or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending UPI Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && <div>Loading...</div>}
                    {!loading && filtered.length === 0 && <div className="text-sm text-muted-foreground">No pending orders.</div>}
                    {filtered.map((o) => (
                        <div key={o.id} className="p-4 border rounded-md space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-medium">{o.order_number}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {o.profiles?.full_name || o.shipping_address?.name || "Customer"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        📧 {o.profiles?.email || o.shipping_address?.email || "No email"} •
                                        📱 {o.profiles?.phone || o.shipping_address?.phone || "No phone"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold">₹{Number(o.total_amount).toLocaleString()}</div>
                                    <Badge variant="outline">{new Date(o.created_at).toLocaleString()}</Badge>
                                </div>
                            </div>

                            {o.payment_screenshot_url && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Screenshot:</label>
                                    <a href={o.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="block">
                                        <img src={o.payment_screenshot_url} alt="Payment proof" className="max-w-xs border rounded-md cursor-pointer hover:opacity-80" />
                                    </a>
                                </div>
                            )}

                            {o.upi_transaction_id && (
                                <div className="text-sm">
                                    <span className="font-medium">UPI Transaction ID:</span> {o.upi_transaction_id}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1">UPI Transaction ID (optional)</label>
                                    <Input value={txnIds[o.id] || ""} onChange={(e) => setTxnIds((prev) => ({ ...prev, [o.id]: e.target.value }))} placeholder="Enter UPI Txn ID" />
                                </div>
                                <div className="flex gap-2">
                                    <Button disabled={marking === o.id} onClick={() => markPaid(o.id)} className="flex-1">{marking === o.id ? "Marking..." : "Mark as Paid"}</Button>
                                    <Button variant="outline" disabled={marking === o.id} onClick={() => cancelOrder(o.id)} className="flex-1">{marking === o.id ? "Cancelling..." : "Cancel Order"}</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}


