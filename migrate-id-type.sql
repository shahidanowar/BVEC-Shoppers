-- ============================================
-- BVEC Shoppers — Database Migration
-- Purpose: Change products.id from UUID to Text without data loss
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Remove the default gen_random_uuid() from the id column
ALTER TABLE products ALTER COLUMN id DROP DEFAULT;

-- 2. Change the column type to Text, automatically casting existing UUIDs to strings
ALTER TABLE products ALTER COLUMN id TYPE text USING id::text;
