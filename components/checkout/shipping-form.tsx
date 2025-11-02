"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ShippingAddress } from "./checkout-flow"
import { MapPin, Plus } from "lucide-react"

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void
}

const mockSavedAddresses = [
  {
    id: "1",
    fullName: "John Doe",
    phone: "+91 98765 43210",
    addressLine1: "123 Main Street",
    addressLine2: "Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true,
  },
  {
    id: "2",
    fullName: "John Doe",
    phone: "+91 98765 43210",
    addressLine1: "456 Business Park",
    addressLine2: "Floor 5, Wing A",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400070",
    isDefault: false,
  },
]

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>("saved-1")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  })

  useEffect(() => {
    // Check if user is logged in and has saved addresses
    const user = localStorage.getItem("user")
    if (!user || mockSavedAddresses.length === 0) {
      setShowNewAddressForm(true)
      setSelectedAddress("new")
    }
  }, [])

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedAddress === "new") {
      onSubmit(formData)
    } else {
      // Use saved address
      const addressIndex = Number.parseInt(selectedAddress.split("-")[1]) - 1
      const savedAddress = mockSavedAddresses[addressIndex]
      onSubmit({
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        addressLine1: savedAddress.addressLine1,
        addressLine2: savedAddress.addressLine2,
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
            {/* Saved Addresses */}
            {mockSavedAddresses.map((address, index) => (
              <div key={address.id} className="flex items-start space-x-3">
                <RadioGroupItem value={`saved-${index + 1}`} id={`saved-${index + 1}`} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={`saved-${index + 1}`} className="cursor-pointer">
                    <div className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="font-medium">{address.fullName}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.pincode}
                      </div>
                      <div className="text-sm text-muted-foreground">{address.phone}</div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}

            {/* New Address Option */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="new" className="cursor-pointer">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add new address</span>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* New Address Form */}
          {selectedAddress === "new" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Continue to Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
