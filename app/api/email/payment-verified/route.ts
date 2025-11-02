import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderNumber, amount, customerEmail, customerName } = body

        if (!customerEmail || !orderNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Verified</h1>
      <p>Order #${orderNumber}</p>
    </div>
    <div class="content">
      <p>Hi ${customerName || "Customer"},</p>
      
      <div class="success-badge">Payment Received Successfully!</div>
      
      <p>Great news! We've received your payment of <strong>₹${Number(amount).toLocaleString()}</strong> for order #${orderNumber}.</p>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>We're now preparing your beautiful sarees</li>
        <li>You'll receive a WhatsApp notification when your order ships</li>
        <li>Expected delivery: 3-5 business days</li>
      </ul>

      <p>You can track your order status in your account dashboard.</p>

      <p>Thank you for shopping with us! 🎉</p>
    </div>
    <div class="footer">
      <p>© ${process.env.NEXT_PUBLIC_STORE_NAME || "Saree Store"} | Questions? ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "Contact us"}</p>
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
                    subject: `Payment Verified - Order #${orderNumber}`,
                    html: emailHtml,
                })

                console.log(`Payment verified email sent to ${customerEmail}`)
            } catch (emailError: any) {
                console.error("Failed to send email:", emailError)
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error("Email error:", e)
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
}

