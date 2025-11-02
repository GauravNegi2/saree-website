console.log("Testing Supabase connection...");

import { createClient } from "@/lib/supabase/client";

async function testConnection() {
  try {
    const supabase = createClient();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("❌ Error connecting to Supabase:", error);
      return false;
    }
    
    console.log("✅ Successfully connected to Supabase!");
    console.log("Sample data:", data);
    return true;
    
  } catch (error) {
    console.error("❌ Exception when connecting to Supabase:", error);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
