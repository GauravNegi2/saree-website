import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/product-catalog"

export default function CollectionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">All Collections</h1>
          <p className="text-lg text-muted-foreground">
            Discover our complete range of premium sarees for every occasion
          </p>
        </div>
        <ProductCatalog />
      </div>
      <Footer />
    </main>
  )
}
