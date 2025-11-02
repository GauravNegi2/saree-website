-- Create an admin user for accessing the admin panel
-- Replace 'your-admin-email@example.com' with your actual email
-- Replace 'your-secure-password' with your actual password

-- First, we need to create the user in auth.users (this is typically done through Supabase Auth)
-- But we can create a profile entry for when the user signs up

-- Insert admin profile (the user must sign up first through the admin login page)
-- This will be referenced when they sign up
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@elegance.com', -- Change this to your admin email
  'Admin User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Note: You'll need to sign up with the email 'admin@elegance.com' 
-- through the admin login page to create the actual auth user
-- The system will then link this profile to your auth user
