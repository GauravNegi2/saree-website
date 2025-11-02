import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/product-catalog"
import { notFound } from "next/navigation"

const categories = {
  silk: { name: "Silk Sarees", description: "Luxurious silk sarees for special occasions" },
  cotton: { name: "Cotton Sarees", description: "Comfortable everyday wear collection" },
  designer: { name: "Designer Sarees", description: "Exclusive designer collections" },
  bridal: { name: "Bridal Sarees", description: "Perfect for your special day" },
  festive: { name: "Festive Wear", description: "Celebrate in style" },
  casual: { name: "Casual Sarees", description: "Effortless everyday elegance" },
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = categories[params.category as keyof typeof categories]

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>
        <ProductCatalog category={params.category} />
      </div>
      <Footer />
    </main>
  )
}
