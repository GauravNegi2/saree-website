"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Shield, Bell, Gift } from "lucide-react"

interface WhatsAppConsentProps {
  onConsent: (phoneNumber: string, consent: boolean) => void
  initialPhone?: string
  initialConsent?: boolean
}

export function WhatsAppConsent({ onConsent, initialPhone = "", initialConsent = false }: WhatsAppConsentProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)
  const [consent, setConsent] = useState(initialConsent)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (phoneNumber && consent) {
      onConsent(phoneNumber, consent)
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">WhatsApp notifications enabled!</span>
          </div>
          <p className="text-sm text-green-600 mt-2">You'll receive order updates and exclusive offers on WhatsApp.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Get Updates on WhatsApp
        </CardTitle>
        <CardDescription>Stay updated with order status, exclusive offers, and cart reminders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span>Order Updates</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>Exclusive Offers</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure & Private</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp-phone">WhatsApp Number</Label>
          <Input
            id="whatsapp-phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="whatsapp-consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="whatsapp-consent" className="text-sm font-normal cursor-pointer">
              I agree to receive WhatsApp notifications about my orders, cart reminders, and exclusive offers
            </Label>
            <p className="text-xs text-muted-foreground">You can opt-out anytime by replying "STOP" to any message</p>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!phoneNumber || !consent} className="w-full">
          Enable WhatsApp Notifications
        </Button>
      </CardContent>
    </Card>
  )
}
