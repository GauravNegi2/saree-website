"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function formatCurrency(n: number) {
    return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function generateUpiLink(amount: number, orderNumber: string) {
    const upiId = (process.env.NEXT_PUBLIC_UPI_ID || "").trim()
    const rawName = (process.env.NEXT_PUBLIC_STORE_NAME || "Saree Store").trim()
    const safeName = encodeURIComponent(rawName.replace(/[^\p{L}\p{N} ]+/gu, "").slice(0, 25))
    const currency = "INR"
    const tn = encodeURIComponent(`Order ${orderNumber}`.slice(0, 40))
    const tr = encodeURIComponent(orderNumber)
    return `upi://pay?pa=${upiId}&pn=${safeName}&am=${amount.toFixed(2)}&cu=${currency}&tn=${tn}&tr=${tr}`
}

export default function OrderConfirmationContent({ orderId }: { orderId: string }) {
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [txnId, setTxnId] = useState("")
    const [screenshotUrl, setScreenshotUrl] = useState("")
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/orders/get?id=${encodeURIComponent(orderId)}`)
                const data = await res.json()
                setOrder(data?.order || null)
                setTxnId(data?.order?.upi_transaction_id || "")
                setScreenshotUrl(data?.order?.payment_screenshot_url || "")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [orderId])

    if (loading) return <div>Loading...</div>
    if (!order) return <div>Order not found</div>

    const upiLink = generateUpiLink(Number(order.total_amount || 0), order.order_number)
    const upiDeepLink = `intent:${upiLink}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`

    const saveProof = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/orders/update-proof", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: order.id, upi_transaction_id: txnId || null, payment_screenshot_url: screenshotUrl || null }),
            })
            if (res.ok) {
                // noop
            }
        } finally {
            setSaving(false)
        }
    }

    const uploadScreenshot = async (file: File) => {
        try {
            setUploading(true)
            const form = new FormData()
            form.append("file", file)
            const res = await fetch(`/api/upload/payment-proof?orderId=${encodeURIComponent(order.id)}`, { method: "POST", body: form })
            const data = await res.json()
            if (data.url) setScreenshotUrl(data.url)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thank you! Order Placed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">Order Number</div>
                        <div className="text-xl font-semibold">{order.order_number}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-2xl font-bold">{formatCurrency(Number(order.total_amount || 0))}</div>
                        <div className="text-sm text-muted-foreground mt-4">Your payment is being verified. You'll receive confirmation within 30 minutes.</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(order.items || []).map((it: any) => (
                            <div key={it.id} className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{it.product?.name || "Product"}</div>
                                    <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                                </div>
                                <div className="font-medium">{formatCurrency(Number(it.price) * Number(it.quantity))}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {order.payment_status === "pending" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Complete Payment (UPI)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <img src={qrImageUrl} alt="UPI QR" width={300} height={300} />
                            </div>
                            <div className="text-center text-sm text-muted-foreground">If you lost the QR, scan again to pay.</div>
                            <div className="flex justify-center">
                                <a className="underline" href={upiDeepLink}>Open in Google Pay</a>
                            </div>
                            <div className="text-xs break-all text-center text-muted-foreground">{upiLink}</div>
                            <div className="flex items-center justify-center gap-4 opacity-80">
                                <img src="/gpay.png" alt="Google Pay" className="h-8" />
                                <img src="/phonepe.png" alt="PhonePe" className="h-8" />
                                <img src="/paytm.png" alt="Paytm" className="h-8" />
                                <img src="/bhim.png" alt="BHIM" className="h-8" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <div className="text-sm mb-1">UPI Transaction ID</div>
                                    <Input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="Enter UPI Txn ID" />
                                </div>
                                <div>
                                    <div className="text-sm mb-1">Payment Screenshot URL</div>
                                    <Input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="Paste screenshot URL" />
                                    <div className="mt-2 flex items-center gap-2">
                                        <input type="file" accept="image/*" onChange={(e) => e.target.files && uploadScreenshot(e.target.files[0])} />
                                        {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                                    </div>
                                </div>
                            </div>
                            <Button disabled={saving} onClick={saveProof}>{saving ? "Saving..." : "Save Payment Proof"}</Button>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-3">
                    <Button asChild>
                        <Link href="/account">Go to My Orders</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}


