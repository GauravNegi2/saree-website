-- Script to create an admin user and verify admin access

-- 1. First, check if the admin user already exists
DO $$
DECLARE
  admin_email TEXT := 'admin@example.com'; -- Change this to your admin email
  admin_user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    -- Create admin user in auth.users (you'll need to sign up first, then we'll update the role)
    RAISE NOTICE 'Admin user does not exist. Please sign up with email: % first, then run this script again.', admin_email;
    RETURN;
  ELSE
    -- Update the user's role to admin in the profiles table
    UPDATE public.profiles 
    SET role = 'admin', 
        updated_at = NOW()
    WHERE id = admin_user_id;
    
    -- Verify the update
    SELECT (role = 'admin') INTO admin_exists 
    FROM public.profiles 
    WHERE id = admin_user_id;
    
    IF admin_exists THEN
      RAISE NOTICE 'Successfully set user % as admin', admin_email;
    ELSE
      RAISE NOTICE 'Failed to update user role to admin';
    END IF;
  END IF;
END $$;

-- 2. Verify admin access to products table
SELECT 
  'Products table RLS status' AS check_type,
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'products';

-- 3. Check admin policies on products table
SELECT 
  'Products table policies' AS check_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check 
FROM pg_policies 
WHERE tablename = 'products';

-- 4. Check if admin can access products (run this after setting up the admin user)
-- This is a test query that should work for admin users
-- SELECT 
--   'Admin products access test' AS check_type,
--   COUNT(*) AS product_count
-- FROM public.products
-- WHERE EXISTS (
--   SELECT 1 FROM public.profiles 
--   WHERE id = auth.uid() AND role = 'admin'
-- );

-- 5. List all admin users for verification
SELECT 
  'Admin users' AS check_type,
  u.id,
  u.email,
  p.role,
  p.created_at AS profile_created,
  u.last_sign_in_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- 6. Check admin routes access
-- This is a placeholder for the actual admin route check
-- You'll need to implement this in your Next.js middleware
SELECT 
  'Admin route check' AS check_type,
  'Implement this check in Next.js middleware' AS details;
