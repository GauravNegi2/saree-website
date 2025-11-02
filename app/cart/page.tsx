import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartView } from "@/components/cart/cart-view"

export default function CartPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CartView />
      </div>
      <Footer />
    </main>
  )
}
