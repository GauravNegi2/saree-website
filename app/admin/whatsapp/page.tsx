"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Send } from "lucide-react"

export default function WhatsAppPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [recipientCount, setRecipientCount] = useState(0)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Load campaigns and abandoned carts
        // For now, these would come from WhatsApp messages table if it exists
        setCampaigns([])
        setAbandonedCarts([])
      } catch (e) {
        console.error("Failed to load WhatsApp data:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { variant: "default" as const, label: "Sent" },
      active: { variant: "default" as const, label: "Active" },
      scheduled: { variant: "secondary" as const, label: "Scheduled" },
      draft: { variant: "outline" as const, label: "Draft" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Management</h1>
          <p className="text-muted-foreground">Manage WhatsApp campaigns and customer communications</p>
        </div>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="abandoned">Abandoned Carts</TabsTrigger>
          <TabsTrigger value="broadcast">Send Broadcast</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Track your WhatsApp marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No WhatsApp campaigns yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Campaign tracking will be available once a WhatsApp messages table is created.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Read Rate</TableHead>
                        <TableHead>Click Rate</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell className="capitalize">{campaign.type}</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                          <TableCell>{campaign.delivered.toLocaleString()}</TableCell>
                          <TableCell>
                            {campaign.delivered > 0 ? `${Math.round((campaign.read / campaign.delivered) * 100)}%` : "-"}
                          </TableCell>
                          <TableCell>
                            {campaign.read > 0 ? `${Math.round((campaign.clicked / campaign.read) * 100)}%` : "-"}
                          </TableCell>
                          <TableCell>{campaign.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Cart Recovery</CardTitle>
              <CardDescription>Send targeted reminders to customers with abandoned carts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading abandoned carts...</div>
              ) : abandonedCarts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No abandoned carts found.</p>
                  <p className="text-sm text-muted-foreground">
                    Abandoned cart tracking requires cart_items table and user session tracking.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Reminders</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abandonedCarts.map((cart) => (
                        <TableRow key={cart.id}>
                          <TableCell className="font-medium">{cart.customer}</TableCell>
                          <TableCell>{cart.phone}</TableCell>
                          <TableCell>{cart.items}</TableCell>
                          <TableCell>₹{cart.value.toLocaleString()}</TableCell>
                          <TableCell>{cart.lastActive}</TableCell>
                          <TableCell>
                            <Badge variant={cart.remindersSent > 0 ? "default" : "secondary"}>{cart.remindersSent}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Send className="mr-2 h-3 w-3" />
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Broadcast Message</CardTitle>
              <CardDescription>Send promotional messages to your customer base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-arrival">New Arrival Announcement</SelectItem>
                      <SelectItem value="sale">Sale Promotion</SelectItem>
                      <SelectItem value="festival">Festival Wishes</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers (2,847)</SelectItem>
                      <SelectItem value="active">Active Customers (1,256)</SelectItem>
                      <SelectItem value="vip">VIP Customers (89)</SelectItem>
                      <SelectItem value="recent">Recent Buyers (456)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message content..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">Character count: {messageContent.length}/1000</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Estimated Recipients: {recipientCount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Cost: ₹{(recipientCount * 0.5).toFixed(2)}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>Configure your WhatsApp Business API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-id">Phone Number ID</Label>
                  <Input id="phone-id" placeholder="Enter phone number ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token</Label>
                  <Input id="access-token" type="password" placeholder="Enter access token" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://yoursite.com/api/whatsapp/webhook" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-token">Webhook Verify Token</Label>
                <Input id="verify-token" placeholder="Enter verify token" />
              </div>

              <Button>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
