# Saree E-Commerce Website

A full-featured e-commerce platform for selling premium sarees, built with Next.js 14, TypeScript, and Supabase.

## Features

- 🛍️ **Product Management**: Browse collections, categories, and new arrivals
- 🛒 **Shopping Cart**: Persistent cart with server-side sync
- 💳 **UPI QR Payment**: Secure UPI QR code payment system
- 👤 **User Accounts**: Customer profiles, order history, address management
- 🔐 **Admin Panel**: Complete admin dashboard with analytics, product management, and order verification
- 📧 **Email Notifications**: Order confirmations and payment verification emails
- 📱 **WhatsApp Integration**: Ready for WhatsApp notifications (Business API)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend API
- **UI Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GauravNegi3/saree-website.git
cd saree-website
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# UPI Payment
NEXT_PUBLIC_UPI_ID=your_upi_id@paytm
NEXT_PUBLIC_STORE_NAME=Your Store Name
NEXT_PUBLIC_SUPPORT_PHONE=+91 98765 43210
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourstore.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_email@gmail.com

# WhatsApp (Optional)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token

# Cron Jobs
CRON_SECRET=your_secret_key
```

4. Set up the database:
Run the SQL scripts in the `scripts/` directory in your Supabase SQL editor:
- `001_create_users_and_profiles.sql`
- `002_create_products_table.sql`
- `003_create_orders_table.sql`
- `005_seed_sample_products.sql` (optional)

5. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   └── ...
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── account/          # Account-related components
│   └── checkout/         # Checkout components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   └── supabase/        # Supabase client setup
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Key Features

### Payment System
- UPI QR code generation per order
- 30-minute payment timeout
- Payment verification dashboard
- Auto-cancel pending orders via cron

### Admin Features
- Real-time analytics dashboard
- Product management (CRUD)
- Order management and verification
- Customer management
- Settings persistence

### Customer Features
- User registration and authentication
- Profile management
- Address book
- Order tracking
- Wishlist
- Newsletter subscription

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Your own server

## Environment Variables Reference

See the installation section above for all required environment variables.

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Shopping cart items
- `wishlists` - User wishlists
- `addresses` - Customer addresses
- `newsletter_subscriptions` - Newsletter subscribers
- `settings` - Admin settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For support, email support@yourstore.com or contact via WhatsApp.

---

Built with ❤️ for elegant sarees

<!-- Updated: Fixed duplicate import issue -->

