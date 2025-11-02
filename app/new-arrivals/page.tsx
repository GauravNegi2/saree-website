import { ProductCatalog } from "@/components/product-catalog"
import { Header } from "@/components/header"

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">New Arrivals</h1>
          <p className="text-lg text-muted-foreground">
            Discover our latest collection of beautiful sarees, fresh from our designers
          </p>
        </div>

        <ProductCatalog category="new-arrivals" title="Latest Collection" showFilters={true} />
      </div>
    </div>
  )
}
