# Vercel Deployment Checklist

## 1. Environment Variables

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

### Required:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_UPI_ID=your_upi_id@paytm
NEXT_PUBLIC_STORE_NAME=Your Store Name
NEXT_PUBLIC_SUPPORT_PHONE=+91 98765 43210
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourstore.com
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

### Email (Resend):
```
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_email@gmail.com
```

### Optional:
```
CRON_SECRET=your_secret_key (for auto-cancel cron jobs)
WHATSAPP_ACCESS_TOKEN=your_token (if using WhatsApp)
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_token
```

## 2. Vercel Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: Leave empty
- **Install Command**: `npm install` (or leave default)
- **Node.js Version**: 18.x or 20.x

## 3. Common Build Issues

### Issue: Module not found
**Solution**: Make sure all dependencies are in `package.json` and run `npm install` locally first.

### Issue: Environment variable undefined
**Solution**: 
- Make sure all `NEXT_PUBLIC_*` vars are added in Vercel
- Redeploy after adding env vars

### Issue: Build timeout
**Solution**: 
- Check for heavy operations during build
- Consider using Vercel Pro plan for longer build times

### Issue: Supabase connection errors
**Solution**:
- Verify Supabase URL and keys
- Check Supabase project is active
- Ensure RLS policies allow public access where needed

## 4. Post-Deployment

1. **Set up custom domain** (optional) in Vercel Dashboard
2. **Update `NEXT_PUBLIC_SITE_URL`** with your actual domain
3. **Test the site** thoroughly:
   - Product browsing
   - User registration/login
   - Cart functionality
   - Checkout flow
   - Admin panel access

## 5. Cron Jobs Setup

To enable auto-cancel of pending orders:
1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Add a cron job:
   - **Path**: `/api/cron/auto-cancel-pending`
   - **Schedule**: `*/30 * * * *` (every 30 minutes)
   - **Time Zone**: Your timezone

## 6. Database Setup

Make sure you've run all SQL scripts in Supabase:
- `001_create_users_and_profiles.sql`
- `002_create_products_table.sql`
- `003_create_orders_table.sql`
- `005_seed_sample_products.sql` (optional)

## 7. Storage Buckets

Create these buckets in Supabase Storage:
- `product-images` (for product photos)
- `payment-proofs` (for payment screenshots)

Set public access policies as needed.

