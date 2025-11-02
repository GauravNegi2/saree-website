"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/contexts/cart-context"
import { Search, Filter, Grid3X3, List, Star, Heart, ShoppingBag, Eye, SlidersHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DbProduct = { id: string; name: string; price: number; original_price: number | null; category: string; images: string[] | null }
const supabase = createClient()
const slugToCategoryName: Record<string, string> = {
  silk: "Silk Sarees",
  cotton: "Cotton Sarees",
  designer: "Designer Sarees",
  bridal: "Bridal Sarees",
  festive: "Festive Wear",
  casual: "Casual Sarees",
}

const useProducts = (category?: string) => {
  const [items, setItems] = useState<DbProduct[]>([])
  useEffect(() => {
    const load = async () => {
      let q = supabase
        .from("products")
        .select("id, name, price, original_price, category, images, created_at, active")
        .or("active.is.true,active.is.null")

      if (category && category !== "new-arrivals") {
        // Use a robust ilike filter so values with spaces (e.g., "Silk Sarees") match slug "silk"
        q = q.ilike("category", `%${category}%`)
      }

      q = q.order("created_at", { ascending: false })
      const { data } = await q
      if ((data || []).length === 0 && category && category !== "new-arrivals") {
        // Fallback: load all active products so the page is not empty if categories mismatch
        const { data: allActive } = await supabase
          .from("products")
          .select("id, name, price, original_price, category, images, created_at, active")
          .or("active.is.true,active.is.null")
          .order("created_at", { ascending: false })
        setItems(allActive || [])
      } else {
        setItems(data || [])
      }
    }
    load()
  }, [category])
  return items
}

interface ProductCatalogProps {
  category?: string
}

export function ProductCatalog({ category }: ProductCatalogProps) {
  const { addItem } = useCart()
  const dbProducts = useProducts(category)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popularity")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 30000])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [showSaleOnly, setShowSaleOnly] = useState(false)

  // Filter options
  const colors = ["red", "blue", "green", "pink", "purple", "gold", "beige"]
  const fabrics = ["silk", "cotton", "georgette", "chiffon", "net"]
  const occasions = ["wedding", "party", "festival", "casual", "office"]
  const brands = ["Elegance", "Heritage", "Modern"]

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const mapped = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.original_price || undefined,
      category: p.category,
      fabric: "silk",
      color: "red",
      occasion: "party",
      brand: "Elegance",
      image: (p.images && p.images[0]) || "/placeholder.svg",
      rating: 4.7,
      reviews: 10,
      isNew: false,
      isSale: false,
    }))
    let filtered = mapped

    // Category filtering handled in query

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by price range
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter((product) => selectedColors.includes(product.color))
    }

    // Filter by fabrics
    if (selectedFabrics.length > 0) {
      filtered = filtered.filter((product) => selectedFabrics.includes(product.fabric))
    }

    // Filter by occasions
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter((product) => selectedOccasions.includes(product.occasion))
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand))
    }

    // Filter by new arrivals
    if (showNewOnly) {
      filtered = filtered.filter((product) => product.isNew)
    }

    // Filter by sale items
    if (showSaleOnly) {
      filtered = filtered.filter((product) => product.isSale)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price)
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price)
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating)
      case "newest":
        return filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      default:
        return filtered.sort((a, b) => b.reviews - a.reviews)
    }
  }, [
    dbProducts,
    category,
    searchQuery,
    sortBy,
    priceRange,
    selectedColors,
    selectedFabrics,
    selectedOccasions,
    selectedBrands,
    showNewOnly,
    showSaleOnly,
  ])

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors([...selectedColors, color])
    } else {
      setSelectedColors(selectedColors.filter((c) => c !== color))
    }
  }

  const handleFabricChange = (fabric: string, checked: boolean) => {
    if (checked) {
      setSelectedFabrics([...selectedFabrics, fabric])
    } else {
      setSelectedFabrics(selectedFabrics.filter((f) => f !== fabric))
    }
  }

  const handleOccasionChange = (occasion: string, checked: boolean) => {
    if (checked) {
      setSelectedOccasions([...selectedOccasions, occasion])
    } else {
      setSelectedOccasions(selectedOccasions.filter((o) => o !== occasion))
    }
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 30000])
    setSelectedColors([])
    setSelectedFabrics([])
    setSelectedOccasions([])
    setSelectedBrands([])
    setShowNewOnly(false)
    setShowSaleOnly(false)
  }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      color: product.color,
    })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Price Range</Label>
        <Slider value={priceRange} onValueChange={setPriceRange} max={30000} min={0} step={500} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Colors</Label>
        <div className="space-y-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
              />
              <Label htmlFor={`color-${color}`} className="text-sm capitalize">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Fabrics */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Fabric</Label>
        <div className="space-y-2">
          {fabrics.map((fabric) => (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox
                id={`fabric-${fabric}`}
                checked={selectedFabrics.includes(fabric)}
                onCheckedChange={(checked) => handleFabricChange(fabric, checked as boolean)}
              />
              <Label htmlFor={`fabric-${fabric}`} className="text-sm capitalize">
                {fabric}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Occasions */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Occasion</Label>
        <div className="space-y-2">
          {occasions.map((occasion) => (
            <div key={occasion} className="flex items-center space-x-2">
              <Checkbox
                id={`occasion-${occasion}`}
                checked={selectedOccasions.includes(occasion)}
                onCheckedChange={(checked) => handleOccasionChange(occasion, checked as boolean)}
              />
              <Label htmlFor={`occasion-${occasion}`} className="text-sm capitalize">
                {occasion}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Brand</Label>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Special</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="new-arrivals" checked={showNewOnly} onCheckedChange={setShowNewOnly} />
            <Label htmlFor="new-arrivals" className="text-sm">
              New Arrivals Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sale-items" checked={showSaleOnly} onCheckedChange={setShowSaleOnly} />
            <Label htmlFor="sale-items" className="text-sm">
              Sale Items Only
            </Label>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Filters</h3>
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <FilterContent />
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Product Grid */}
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${viewMode === "list" ? "flex" : ""
                }`}
            >
              <div
                className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[3/4]"}`}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.isNew && (
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">New</Badge>
                )}
                {product.isSale && (
                  <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">Sale</Badge>
                )}

                {/* Quick Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4 mr-1" />
                    Quick View
                  </Button>
                </div>
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-balance">{product.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs capitalize">
                    {product.fabric}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {product.occasion}
                  </Badge>
                </div>

                <Button className="w-full" onClick={() => handleAddToCart(product)}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No products found matching your criteria</p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
