-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  original_price decimal(10,2),
  category text not null,
  subcategory text,
  fabric text,
  color text,
  size text,
  stock_quantity integer default 0,
  images text[] default '{}',
  featured boolean default false,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;

-- RLS policies for products
create policy "Anyone can view active products" on public.products
  for select using (active = true);

-- Admin can manage all products
create policy "Admins can manage products" on public.products
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for better performance
create index if not exists products_category_idx on public.products(category);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_active_idx on public.products(active);
