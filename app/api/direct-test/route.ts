import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Hardcoded Supabase credentials
const SUPABASE_URL = 'https://sjlqsltcrwslveaxldvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbHFzbHRjcndzbHZlYXhsZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAxNjYsImV4cCI6MjA3MzY5NjE2Nn0.yNYXbN2FEr18ckdi_MRosIKt_eVPrbmZWvzgcouqnnQ';

export async function GET() {
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
