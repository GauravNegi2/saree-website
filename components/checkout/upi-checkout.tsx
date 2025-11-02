"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function generateOrderNumber(): string {
    return `ORD-${Date.now()}`
}

function formatCurrency(n: number): string {
    return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function generateUpiLink(cartTotal: number, orderId: string): string {
    const upiId = (process.env.NEXT_PUBLIC_UPI_ID || "").trim()
    const rawName = (process.env.NEXT_PUBLIC_STORE_NAME || "Saree Store").trim()
    const safeName = encodeURIComponent(rawName.replace(/[^\p{L}\p{N} ]+/gu, "").slice(0, 25))
    const amount = Number.isFinite(cartTotal) ? cartTotal.toFixed(2) : "0.00"
    const currency = "INR"
    const tn = encodeURIComponent(`Order ${orderId}`.slice(0, 40))
    const tr = encodeURIComponent(orderId)
    return `upi://pay?pa=${upiId}&pn=${safeName}&am=${amount}&cu=${currency}&tn=${tn}&tr=${tr}`
}

export function UpiCheckout() {
    const { state, clearCart } = useCart()
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [orderId, setOrderId] = useState<string>("")
    const [secondsLeft, setSecondsLeft] = useState<number>(30 * 60)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setOrderId(generateOrderNumber())
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const subtotal = useMemo(() => state.items.reduce((sum, it) => sum + it.price * it.quantity, 0), [state.items])
    const shipping = useMemo(() => (subtotal >= 999 ? 0 : state.items.length > 0 ? 99 : 0), [subtotal, state.items.length])
    const discount = 0
    const total = Math.max(0, subtotal + shipping - discount)

    const upiLink = useMemo(() => generateUpiLink(total, orderId || generateOrderNumber()), [total, orderId])
    const upiDeepLink = useMemo(() => `intent:${upiLink}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`, [upiLink])
    const qrImageUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiLink)}`, [upiLink])

    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60

    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || ""
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ""

    const handleConfirmPayment = async () => {
        if (!name || !phone || !email || !address) return
        setSubmitting(true)
        try {
            // Create order + items in Supabase via API
            const res = await fetch("/api/orders/create-upi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderNumber: orderId,
                    amount: total,
                    shippingAddress: { name, phone, email, address },
                    items: state.items.map((it) => ({ product_id: it.id, quantity: it.quantity, price: it.price })),
                }),
            })
            if (!res.ok) {
                console.error(await res.text())
                setSubmitting(false)
                return
            }
            const data = await res.json()
            clearCart()
            window.location.href = `/order/confirmation/${encodeURIComponent(data.orderId)}`
        } catch (e) {
            setSubmitting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address</Label>
                            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {state.items.map((it) => (
                                <div key={it.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={it.image} alt={it.name} className="w-14 h-14 rounded object-cover" />
                                        <div>
                                            <div className="font-medium">{it.name}</div>
                                            <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="font-medium">{formatCurrency(it.price * it.quantity)}</div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">Subtotal</div>
                            <div>{formatCurrency(subtotal)}</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">Shipping</div>
                            <div>{shipping === 0 ? "Free" : formatCurrency(shipping)}</div>
                        </div>
                        {discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-muted-foreground">Discount</div>
                                <div>-{formatCurrency(discount)}</div>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-lg font-semibold">
                            <div>Total</div>
                            <div>{formatCurrency(total)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pay via UPI (Google Pay / PhonePe / Paytm)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!process.env.NEXT_PUBLIC_UPI_ID && (
                            <div className="text-sm text-red-600">UPI ID is not configured. Set NEXT_PUBLIC_UPI_ID in environment.</div>
                        )}
                        <div className="text-sm text-muted-foreground">Order: {orderId}</div>
                        <div className="flex justify-center">
                            <img src={qrImageUrl} alt="UPI QR" width={320} height={320} />
                        </div>
                        <div className="text-center font-medium">
                            Scan with any UPI app to pay {formatCurrency(total)}
                        </div>
                        <div className="flex justify-center">
                            <Button asChild variant="outline">
                                <a href={upiDeepLink}>Open in Google Pay</a>
                            </Button>
                        </div>
                        <div className="text-xs break-all text-center text-muted-foreground">
                            {upiLink}
                        </div>
                        <div className="flex items-center justify-center gap-4 opacity-80">
                            <img src="/gpay.png" alt="Google Pay" className="h-8" />
                            <img src="/phonepe.png" alt="PhonePe" className="h-8" />
                            <img src="/paytm.png" alt="Paytm" className="h-8" />
                            <img src="/bhim.png" alt="BHIM" className="h-8" />
                        </div>
                        <div className="text-center text-sm text-muted-foreground">Time left: {minutes}:{String(seconds).padStart(2, "0")}</div>
                        <div className="space-y-2 text-sm">
                            <div className="font-semibold">How to Pay / भुगतान कैसे करें</div>
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>Open any UPI app (Google Pay, PhonePe, Paytm, BHIM)</li>
                                <li>Tap on "Scan QR Code"</li>
                                <li>Scan this QR code</li>
                                <li>Verify amount: {formatCurrency(total)}</li>
                                <li>Enter your UPI PIN and confirm payment</li>
                                <li>Take screenshot of payment confirmation</li>
                                <li>Click "I have completed payment"</li>
                            </ol>
                        </div>
                        <Button className="w-full" size="lg" disabled={submitting || total <= 0} onClick={handleConfirmPayment}>
                            {submitting ? "Processing..." : "I have completed payment"}
                        </Button>
                        <div className="text-xs text-muted-foreground text-center">
                            Need help? Call {supportPhone} or email {supportEmail}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
