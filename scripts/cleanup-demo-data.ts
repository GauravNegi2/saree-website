import { createClient } from "@/lib/supabase/server"

async function cleanupDemoData() {
  console.log("Starting cleanup of demo data...")
  
  const supabase = createClient()
  
  try {
    // 1. Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
    
    if (tablesError) throw tablesError
    
    console.log("Found tables:", tables.map(t => t.tablename))
    
    // 2. Delete data from each table (except auth.users which is managed by Supabase Auth)
    for (const { tablename } of tables) {
      if (tablename !== 'users') { // Skip auth.users
        console.log(`Deleting data from ${tablename}...`)
        const { error } = await supabase
          .from(tablename)
          .delete()
          .neq('id', '') // Delete all rows
        
        if (error) {
          console.warn(`  Could not clear ${tablename}:`, error.message)
        } else {
          console.log(`  ✅ Cleared ${tablename}`)
        }
      }
    }
    
    console.log("✅ Cleanup completed successfully!")
    return true
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error)
    return false
  }
}

// Run the cleanup
cleanupDemoData()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
