"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Key, MessageCircle, CreditCard, Bell, CheckCircle2 } from "lucide-react"

interface Settings {
  storeName: string
  storeEmail: string
  storePhone: string
  whatsappNumber: string
  currency: string
  taxRate: string
  shippingFee: string
  freeShippingThreshold: string
  whatsappEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  cartAbandonmentEnabled: boolean
  orderConfirmationEnabled: boolean
  shippingUpdatesEnabled: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeName: "Elegance Sarees",
    storeEmail: "admin@elegancesarees.com",
    storePhone: "+91 98765 43210",
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (res.ok && data.settings) {
          setSettings(data.settings)
        }
      } catch (e) {
        console.error("Failed to load settings:", e)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        console.error("Failed to save settings:", data.error)
      }
    } catch (e) {
      console.error("Failed to save settings:", e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic details about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Shipping</CardTitle>
              <CardDescription>Configure pricing and shipping options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingFee">Shipping Fee (₹)</Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    value={settings.shippingFee}
                    onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Business Configuration
              </CardTitle>
              <CardDescription>Configure WhatsApp Business API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable WhatsApp Integration</Label>
                  <p className="text-sm text-muted-foreground">Allow sending messages to customers</p>
                </div>
                <Switch
                  checked={settings.whatsappEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, whatsappEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Business Number</Label>
                <Input
                  id="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Message Templates</h4>

                <div className="space-y-2">
                  <Label htmlFor="cartAbandonmentTemplate">Cart Abandonment Message</Label>
                  <Textarea
                    id="cartAbandonmentTemplate"
                    placeholder="Hi {name}, you left some beautiful sarees in your cart. Complete your purchase now and get 10% off!"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderConfirmationTemplate">Order Confirmation Message</Label>
                  <Textarea
                    id="orderConfirmationTemplate"
                    placeholder="Thank you {name}! Your order #{orderNumber} has been confirmed. We'll notify you once it's shipped."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingUpdateTemplate">Shipping Update Message</Label>
                  <Textarea
                    id="shippingUpdateTemplate"
                    placeholder="Great news {name}! Your order #{orderNumber} has been shipped and will arrive by {deliveryDate}."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Configuration
              </CardTitle>
              <CardDescription>Configure Razorpay payment settings for Indian customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Razorpay Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                    <Input id="razorpayKeyId" type="password" placeholder="rzp_test_..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                    <Input id="razorpayKeySecret" type="password" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Indian Payment Methods</span>
                </div>
                <p className="text-sm text-green-700">
                  Razorpay supports UPI, Net Banking, Cards, and Cash on Delivery - perfect for Indian customers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure when and how to notify customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Admin Notifications</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for new orders</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive SMS alerts for urgent matters</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Customer WhatsApp Notifications</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cart Abandonment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders for abandoned carts after 1 hour</p>
                  </div>
                  <Switch
                    checked={settings.cartAbandonmentEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cartAbandonmentEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Send confirmation messages for new orders</p>
                  </div>
                  <Switch
                    checked={settings.orderConfirmationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, orderConfirmationEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shipping Updates</Label>
                    <p className="text-sm text-muted-foreground">Send tracking updates when orders are shipped</p>
                  </div>
                  <Switch
                    checked={settings.shippingUpdatesEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, shippingUpdatesEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end items-center gap-4">
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Settings saved successfully!</span>
          </div>
        )}
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
