import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import OrderConfirmationContent from "./content"

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <Suspense>
                    <OrderConfirmationContent orderId={params.orderId} />
                </Suspense>
            </div>
            <Footer />
        </main>
    )
}


