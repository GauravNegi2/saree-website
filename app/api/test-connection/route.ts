import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Force dynamic rendering - this route uses cookies
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get environment variables directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { 
          error: 'Configuration error',
          message: 'Missing Supabase environment variables',
          details: {
            hasSupabaseUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseAnonKey
          }
        },
        { status: 500 }
      );
    }

    // Create a new client directly
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );
    
    // Test a simple query
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json(
        { 
          error: 'Database error',
          message: error.message,
          details: error
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Successfully connected to Supabase!',
      config: {
        url: supabaseUrl ? '✅ Set' : '❌ Missing',
        key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
      }
    });
    
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
