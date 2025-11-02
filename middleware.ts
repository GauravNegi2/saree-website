import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Create a response object
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Add CORS headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204 })
      }
    }

    // Initialize Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none' }) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    // Admin route protection
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Skip auth check for login page
      if (request.nextUrl.pathname === "/admin/login") {
        return response
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          const loginUrl = new URL("/admin/login", request.url)
          loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
          return NextResponse.redirect(loginUrl)
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile || profile.role !== "admin") {
          const loginUrl = new URL("/admin/login", request.url)
          loginUrl.searchParams.set("error", "unauthorized")
          return NextResponse.redirect(loginUrl)
        }

        // Add security headers for admin routes
        response.headers.set("X-Frame-Options", "DENY")
        response.headers.set("X-Content-Type-Options", "nosniff")
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

      } catch (error) {
        console.error("Admin route error:", error)
        return NextResponse.redirect(new URL("/error?code=auth_failed", request.url))
      }
    }

    // WhatsApp webhook verification
    if (request.nextUrl.pathname.startsWith("/api/whatsapp/webhook")) {
      if (!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
        console.error("Missing WHATSAPP_WEBHOOK_VERIFY_TOKEN in environment variables")
        return new NextResponse("Server configuration error", { status: 500 })
      }

      const verifyToken = request.nextUrl.searchParams.get("hub.verify_token")
      const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

      if (verifyToken && verifyToken === expectedToken) {
        const challenge = request.nextUrl.searchParams.get("hub.challenge")
        if (challenge) {
          return new NextResponse(challenge)
        }
      }

      return new NextResponse("Invalid verification token", { status: 403 })
    }

    return response

  } catch (error) {
    console.error("Middleware error:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}

export const config = {
  matcher: [
    "/api/whatsapp/webhook/:path*",
    "/api/:path*" // Match all API routes for CORS
  ],
}
