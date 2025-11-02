# Create .env.local file with Supabase credentials
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL="https://sjlqsltcrwslveaxldvh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbHFzbHRjcndzbHZlYXhsZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAxNjYsImV4cCI6MjA3MzY5NjE2Nn0.yNYXbN2FEr18ckdi_MRosIKt_eVPrbmZWvzgcouqnnQ"
NODE_ENV="development"
"@

# Write to .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host "Please restart your development server for the changes to take effect." -ForegroundColor Yellow
