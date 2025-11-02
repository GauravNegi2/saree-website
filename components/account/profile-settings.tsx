"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, Bell, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileSettingsProps {
  user: {
    id: string
    email: string
    name: string
  }
  onUserUpdate: (user: {
    id: string
    email: string
    name: string
  }) => void
}

export function ProfileSettings({ user, onUserUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    whatsappNumber: "",
  })
  const [notifications, setNotifications] = useState({
    whatsappCart: true,
    whatsappOrders: true,
    whatsappPromotions: true,
    emailNewsletter: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const authUser = userRes.user
      if (!authUser || !mounted) return
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", authUser.id).single()
      setFormData((prev) => ({
        ...prev,
        name: (profile?.full_name as string) ?? user.name,
        whatsappNumber: (profile?.phone as string) ?? "",
      }))
    }
    load()
    return () => {
      mounted = false
    }
  }, [user.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess("")

    try {
      const supabase = createClient()
      const { data: userRes } = await supabase.auth.getUser()
      const authUser = userRes.user
      if (!authUser) throw new Error("Not authenticated")

      // Update profile fields in public.profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ full_name: formData.name, phone: formData.whatsappNumber })
        .eq("id", authUser.id)

      if (profileErr) throw profileErr

      // Optionally sync auth metadata name
      await supabase.auth.updateUser({
        data: { full_name: formData.name, whatsapp_number: formData.whatsappNumber },
      })

      onUserUpdate({ id: user.id, email: formData.email, name: formData.name })
      setSuccess("Profile updated successfully!")
    } catch (err) {
      console.error("Update failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Required for cart notifications and order updates</p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              WhatsApp Notifications
            </h4>

            <div className="space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-cart"
                  checked={notifications.whatsappCart}
                  onCheckedChange={(checked) => handleNotificationChange("whatsappCart", checked as boolean)}
                />
                <Label htmlFor="whatsapp-cart" className="text-sm">
                  Cart reminders and abandoned cart notifications
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-orders"
                  checked={notifications.whatsappOrders}
                  onCheckedChange={(checked) => handleNotificationChange("whatsappOrders", checked as boolean)}
                />
                <Label htmlFor="whatsapp-orders" className="text-sm">
                  Order confirmations and shipping updates
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-promotions"
                  checked={notifications.whatsappPromotions}
                  onCheckedChange={(checked) => handleNotificationChange("whatsappPromotions", checked as boolean)}
                />
                <Label htmlFor="whatsapp-promotions" className="text-sm">
                  Promotional offers and new arrivals
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h4>

            <div className="space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-newsletter"
                  checked={notifications.emailNewsletter}
                  onCheckedChange={(checked) => handleNotificationChange("emailNewsletter", checked as boolean)}
                />
                <Label htmlFor="email-newsletter" className="text-sm">
                  Newsletter and styling tips
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Two-Factor Authentication</Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
