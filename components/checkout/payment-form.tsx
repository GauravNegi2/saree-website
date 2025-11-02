"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PaymentMethod } from "./checkout-flow"
import { CreditCard, Smartphone, Building, Truck } from "lucide-react"

interface PaymentFormProps {
  onSubmit: (payment: PaymentMethod) => void
}

export function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("card")
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [upiId, setUpiId] = useState("")
  const [selectedBank, setSelectedBank] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let paymentMethod: PaymentMethod

    switch (selectedMethod) {
      case "card":
        paymentMethod = {
          type: "card",
          details: cardData,
        }
        break
      case "upi":
        paymentMethod = {
          type: "upi",
          details: { upiId },
        }
        break
      case "netbanking":
        paymentMethod = {
          type: "netbanking",
          details: { bank: selectedBank },
        }
        break
      case "cod":
        paymentMethod = {
          type: "cod",
        }
        break
      default:
        return
    }

    onSubmit(paymentMethod)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {/* Credit/Debit Card */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="card" id="card" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="card" className="cursor-pointer">
                  <div className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 font-medium">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Visa, Mastercard, RuPay, American Express</div>
                  </div>
                </Label>
              </div>
            </div>

            {selectedMethod === "card" && (
              <div className="ml-8 space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData((prev) => ({ ...prev, number: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name *</Label>
                  <Input
                    id="cardName"
                    placeholder="Name on card"
                    value={cardData.name}
                    onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData((prev) => ({ ...prev, expiry: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="upi" id="upi" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="upi" className="cursor-pointer">
                  <div className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 font-medium">
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">GPay, PhonePe, Paytm, BHIM</div>
                  </div>
                </Label>
              </div>
            </div>

            {selectedMethod === "upi" && (
              <div className="ml-8 space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Net Banking */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="netbanking" id="netbanking" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="netbanking" className="cursor-pointer">
                  <div className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 font-medium">
                      <Building className="h-4 w-4" />
                      Net Banking
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">All major banks supported</div>
                  </div>
                </Label>
              </div>
            </div>

            {selectedMethod === "netbanking" && (
              <div className="ml-8 space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="bank">Select Bank *</Label>
                  <Select value={selectedBank} onValueChange={setSelectedBank} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sbi">State Bank of India</SelectItem>
                      <SelectItem value="hdfc">HDFC Bank</SelectItem>
                      <SelectItem value="icici">ICICI Bank</SelectItem>
                      <SelectItem value="axis">Axis Bank</SelectItem>
                      <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                      <SelectItem value="pnb">Punjab National Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Cash on Delivery */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="cod" id="cod" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="cod" className="cursor-pointer">
                  <div className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2 font-medium">
                      <Truck className="h-4 w-4" />
                      Cash on Delivery
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Pay when your order is delivered</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <Button type="submit" className="w-full" size="lg">
            Continue to Review
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
