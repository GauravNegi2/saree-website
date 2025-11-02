import { createClient } from "@/lib/supabase/server"

async function listTables() {
  console.log("Connecting to Supabase...")
  
  const supabase = createClient()
  
  try {
    // Test connection by listing tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
    
    if (error) {
      console.error("❌ Error listing tables:", error)
      return false
    }
    
    console.log("✅ Successfully connected to Supabase!")
    console.log("\nTables in your database:")
    tables.forEach(({ tablename }) => console.log(`- ${tablename}`))
    
    return true
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return false
  }
}

// Run the test
listTables()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
