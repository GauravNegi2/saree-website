import { createBrowserClient } from "@supabase/ssr"
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl && typeof window !== 'undefined') {
  console.error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey && typeof window !== 'undefined') {
  console.error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>

export function createClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  )
}

export type { Database } from '@/types/supabase'
