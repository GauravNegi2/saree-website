import { NextResponse } from "next/server";

export async function GET() {
  // Get environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    message: supabaseUrl && supabaseAnonKey 
      ? 'Environment variables are set correctly!'
      : 'Some environment variables are missing!',
  });
}
