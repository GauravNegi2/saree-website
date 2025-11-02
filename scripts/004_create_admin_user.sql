-- Insert admin user profile (you'll need to sign up with this email first)
-- This is just a placeholder - the actual admin user will be created when they sign up
-- Then you can update their role to 'admin'

-- Function to promote user to admin (call this after admin signs up)
create or replace function promote_to_admin(user_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles 
  set role = 'admin' 
  where email = user_email;
end;
$$;

-- Example usage (run this after admin signs up):
-- select promote_to_admin('admin@elegance.com');
