import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, amount, customerEmail, customerName, items } = body

    if (!customerEmail || !orderNumber || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch order items with product details
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity, price, products ( name, images )")
      .eq("order_id", orderId)

    // Generate invoice HTML
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .order-summary { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .total { font-weight: bold; font-size: 18px; color: #8B5CF6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
      <p>Order #${orderNumber}</p>
    </div>
    <div class="content">
      <p>Hi ${customerName || "Customer"},</p>
      <p>Thank you for your order! We're preparing your beautiful sarees and will notify you once they ship.</p>
      
      <div class="order-summary">
        <h2>Order Summary</h2>
        ${(orderItems || [])
        .map(
          (item: any) => `
          <div class="item-row">
            <span>${item.products?.name || "Product"} (Qty: ${item.quantity})</span>
            <span>₹${Number(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `
        )
        .join("")}
        <div class="item-row total">
          <span>Total Amount</span>
          <span>₹${Number(amount).toLocaleString()}</span>
        </div>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Complete payment via UPI within 30 minutes</li>
        <li>Upload payment screenshot in your order confirmation page</li>
        <li>You'll receive WhatsApp updates when your order ships</li>
      </ul>

      <p>Track your order: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/confirmation/${orderId}">View Order</a></p>
    </div>
    <div class="footer">
      <p>© ${process.env.NEXT_PUBLIC_STORE_NAME || "Saree Store"} | Need help? ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "Contact us"}</p>
    </div>
  </div>
</body>
</html>
    `

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "noreply@example.com"

        await resend.emails.send({
          from: fromEmail,
          to: customerEmail,
          subject: `Order Confirmation #${orderNumber} - ${process.env.NEXT_PUBLIC_STORE_NAME || "Your Order"}`,
          html: invoiceHtml,
        })

        console.log(`Order confirmation email sent to ${customerEmail}`)
      } catch (emailError: any) {
        console.error("Failed to send email via Resend:", emailError)
        // Non-blocking - order is still created even if email fails
      }
    } else {
      console.warn("RESEND_API_KEY not configured - email not sent")
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Email error:", e)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

