import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic rendering - this route should not be statically generated
export const dynamic = 'force-dynamic'

// Use environment variables instead of hardcoded credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Configuration error',
        message: 'Missing Supabase environment variables'
      },
      { status: 500 }
    );
  }
  try {
    console.log('Creating Supabase client...');
    
    // Create a direct Supabase client using the standard client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    console.log('Supabase client created, testing connection...');
    
    // First, try a simple RPC call to test the connection
    const { data: version, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('Version check failed:', versionError);
      // If version check fails, try a direct table query
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Connected to Supabase (direct table query)',
        data: data || [],
        config: {
          url: SUPABASE_URL,
          key: '✅ Set (first 10 chars shown for security)'
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase!',
      version: version,
      config: {
        url: SUPABASE_URL,
        key: '✅ Set (first 10 chars shown for security)'
      }
    });
    
  } catch (error: any) {
    console.error('Direct test error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Connection failed',
        message: error?.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? 
          {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
