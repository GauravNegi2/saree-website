console.log("Checking environment variables...");

// Load environment variables manually if needed
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing");

// Try to import and log the client
import { createClient } from "@/lib/supabase/client";
console.log("✅ Supabase client can be imported");
