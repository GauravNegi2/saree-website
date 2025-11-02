import { createClient } from "@/lib/supabase/client"

async function testSupabaseConnection() {
  console.log("Testing Supabase connection...")
  
  const supabase = createClient()
  
  try {
    // Test authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Error getting session:", sessionError)
      return false
    }
    
    console.log("✅ Supabase connection successful!")
    console.log("Session:", session ? "User is authenticated" : "No active session")
    
    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}

testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log("✅ All tests passed!")
    } else {
      console.error("❌ Some tests failed")
    }
    process.exit(success ? 0 : 1)
  })
