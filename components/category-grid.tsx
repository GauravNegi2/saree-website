import Link from "next/link"
import { Card } from "@/components/ui/card"

const categories = [
  {
    name: "Silk Sarees",
    description: "Luxurious silk sarees for special occasions",
    image: "/beautiful-silk-saree-in-rich-colors-traditional-in.jpg",
    href: "/collections/silk",
    featured: true,
  },
  {
    name: "Cotton Sarees",
    description: "Comfortable everyday wear",
    image: "/elegant-cotton-saree-in-soft-colors-comfortable-da.jpg",
    href: "/collections/cotton",
  },
  {
    name: "Designer Sarees",
    description: "Exclusive designer collections",
    image: "/modern-designer-saree-with-contemporary-patterns-f.jpg",
    href: "/collections/designer",
  },
  {
    name: "Bridal Sarees",
    description: "Perfect for your special day",
    image: "/ornate-bridal-saree-with-heavy-embroidery-gold-wor.jpg",
    href: "/collections/bridal",
    featured: true,
  },
  {
    name: "Festive Wear",
    description: "Celebrate in style",
    image: "/colorful-festive-saree-with-traditional-motifs-cel.jpg",
    href: "/collections/festive",
  },
  {
    name: "Casual Sarees",
    description: "Effortless everyday elegance",
    image: "/simple-elegant-casual-saree-in-pastel-colors-offic.jpg",
    href: "/collections/casual",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-balance">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore our curated collections designed for every occasion and style preference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link key={category.name} href={category.href}>
              <Card
                className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  category.featured ? "md:col-span-1 lg:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-serif font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
