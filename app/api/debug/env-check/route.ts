import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_UPI_ID: process.env.NEXT_PUBLIC_UPI_ID ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? "✅ Set" : "❌ Missing",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing (optional)",
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ? "✅ Set" : "❌ Missing (optional)",
  }

  const missing = Object.entries(envVars)
    .filter(([_, value]) => value.includes("❌ Missing"))
    .map(([key, _]) => key)

  return NextResponse.json({
    status: missing.length === 0 ? "✅ All required variables set" : "⚠️ Missing some variables",
    environment: envVars,
    missingRequired: missing.filter(k => !k.includes("RESEND") && !k.includes("UPI")),
    missingOptional: missing.filter(k => k.includes("RESEND") || k.includes("UPI")),
    nodeEnv: process.env.NODE_ENV,
  })
}

