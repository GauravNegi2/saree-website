"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MapPin, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Address = {
  id: string
  user_id: string
  name: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string | null
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const authUser = userRes.user
      if (!authUser) return
      // If you have an addresses table, adjust the select accordingly. Otherwise keep empty state.
      const { data: rows } = await supabase
        .from("addresses")
        .select("id, user_id, name, full_name, phone, address_line_1, address_line_2, city, state, pincode, is_default")
        .eq("user_id", authUser.id)
        .order("is_default", { ascending: false })
      setAddresses((rows as Address[]) || [])
    }
    load()
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const authUser = userRes.user
    if (!authUser) return

    if (editingAddress) {
      await supabase
        .from("addresses")
        .update({
          name: formData.name,
          full_name: formData.fullName,
          phone: formData.phone,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2 || null,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          is_default: formData.isDefault,
        })
        .eq("id", editingAddress.id)
        .eq("user_id", authUser.id)
    } else {
      await supabase
        .from("addresses")
        .insert({
          user_id: authUser.id,
          name: formData.name,
          full_name: formData.fullName,
          phone: formData.phone,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2 || null,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          is_default: formData.isDefault,
        })
    }

    // Reload
    const { data: rows } = await supabase
      .from("addresses")
      .select("id, user_id, name, full_name, phone, address_line_1, address_line_2, city, state, pincode, is_default")
      .eq("user_id", authUser.id)
      .order("is_default", { ascending: false })
    setAddresses((rows as Address[]) || [])

    // Reset form and close dialog
    setFormData({
      name: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    })
    setEditingAddress(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (address: any) => {
    setEditingAddress(address)
    setFormData({
      name: address.name || "",
      fullName: address.full_name || "",
      phone: address.phone || "",
      addressLine1: address.address_line_1 || "",
      addressLine2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: Boolean(address.is_default),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const authUser = userRes.user
    if (!authUser) return
    await supabase.from("addresses").delete().eq("id", id).eq("user_id", authUser.id)
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const handleSetDefault = async (id: string) => {
    const supabase = createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const authUser = userRes.user
    if (!authUser) return
    // Clear current default and set new one
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", authUser.id)
    await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", authUser.id)
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Address Book</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Home, Office"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleInputChange("isDefault", checked as boolean)}
                />
                <Label htmlFor="isDefault" className="text-sm">
                  Set as default address
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingAddress ? "Update Address" : "Add Address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingAddress(null)
                    setFormData({
                      name: "",
                      fullName: "",
                      phone: "",
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      state: "",
                      pincode: "",
                      isDefault: false,
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card key={address.id} className={address.is_default ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {address.name}
                </CardTitle>
                {address.is_default && <Badge>Default</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{address.full_name}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <div className="text-sm">
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  disabled={address.is_default}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
                {!address.is_default && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>
                    Set Default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No addresses saved</p>
          <p className="text-sm text-muted-foreground">Add your first address to get started</p>
        </div>
      )}
    </div>
  )
}
