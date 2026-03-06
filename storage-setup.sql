-- ============================================
-- BVEC Shoppers — Supabase Storage RLS Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create the bucket (if not already created)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true) 
on conflict (id) do nothing;

-- 2. Drop existing policies (if re-running)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Users Upload" on storage.objects;
drop policy if exists "Users Update Own Images" on storage.objects;
drop policy if exists "Users Delete Own Images" on storage.objects;

-- 3. Policy for public viewing
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'product-images' );

-- 4. Policy for authenticated users to upload new files
create policy "Auth Users Upload" 
on storage.objects for insert 
with check ( 
  bucket_id = 'product-images' 
  and auth.role() = 'authenticated' 
);

-- 5. Policy for users to update files they uploaded
create policy "Users Update Own Images" 
on storage.objects for update 
using ( 
  bucket_id = 'product-images' 
  and auth.uid() = owner 
);

-- 6. Policy for users to delete files they uploaded
create policy "Users Delete Own Images" 
on storage.objects for delete 
using ( 
  bucket_id = 'product-images' 
  and auth.uid() = owner 
);
