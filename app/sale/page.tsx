import { ProductCatalog } from "@/components/product-catalog"
import { Header } from "@/components/header"

export default function SalePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-serif font-bold text-foreground">Sale</h1>
            <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
              Up to 50% OFF
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Don't miss out on our amazing deals and discounts on premium sarees
          </p>
        </div>

        <ProductCatalog category="sale" title="Sale Items" showFilters={true} />
      </div>
    </div>
  )
}
