"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Gift } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSubscribed(true)
        setEmail("")
      } else {
        setError(data.error || "Subscription failed. Please try again.")
      }
    } catch (err) {
      setError("Subscription failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-balance">
                Get 10% Off Your First Order
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and styling
                tips from our fashion experts.
              </p>

              {!isSubscribed ? (
                <>
                  {error && (
                    <div className="mb-4 text-sm text-red-600 text-center max-w-md mx-auto">{error}</div>
                  )}
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" size="lg" className="px-8" disabled={isLoading}>
                      {isLoading ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-green-600">
                    Thank you for subscribing! Check your email for your discount code.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-4">
                By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
