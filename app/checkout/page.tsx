import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UpiCheckout } from "@/components/checkout/upi-checkout"

export default function CheckoutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <UpiCheckout />
      </div>
      <Footer />
    </main>
  )
}
