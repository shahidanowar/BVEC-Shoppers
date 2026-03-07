-- ============================================
-- BVEC Shoppers — Full Database Reset
-- WARNING: THIS DELETES ALL DATA IN YOUR APP
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Delete all products
TRUNCATE TABLE public.products CASCADE;

-- 2. Delete all user profiles (this will CASCADE from auth.users if run in reverse, but safe to do here)
TRUNCATE TABLE public.profiles CASCADE;

-- Notes on fully resetting:
-- You cannot delete Auth Users or Storage Files purely from public SQL due to security restrictions.
-- See the instructions provided by the AI for the dashboard steps to clear Auth and Storage.
