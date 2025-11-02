"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  images: string[]
  featured: boolean
  created_at: string
}

export function FeaturedCollections() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data: featured, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .eq("active", true)
        .limit(3)

      const { data: recent, error: recentError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(3)

      if (featuredError) throw featuredError
      if (recentError) throw recentError

      setTrendingProducts(featured || [])
      setNewProducts(recent || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading collections...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const collections = [
    {
      title: "Featured Collection",
      subtitle: "Handpicked by Our Experts",
      products: trendingProducts,
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh from Our Designers",
      products: newProducts,
    },
  ]

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {collections.map((collection, collectionIndex) => (
          <div key={collection.title} className={collectionIndex > 0 ? "mt-16" : ""}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{collection.title}</h2>
                <p className="text-lg text-muted-foreground">{collection.subtitle}</p>
              </div>
              <Button variant="outline" asChild className="hidden md:flex bg-transparent">
                <Link href="/collections">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {collection.products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products available in this collection yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add products through the admin panel to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.products.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.images?.[0] || "/placeholder.svg?height=400&width=300&query=saree"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {collection.title === "New Arrivals" && (
                        <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">New</Badge>
                      )}
                      {product.original_price && product.original_price > product.price && (
                        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-balance">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">₹{product.price?.toLocaleString()}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-8 md:hidden">
              <Button variant="outline" asChild>
                <Link href="/collections">
                  View All {collection.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
