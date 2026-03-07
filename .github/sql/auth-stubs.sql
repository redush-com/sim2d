-- Stubs for Supabase auth schema used in CI migration testing.
-- Mimics the auth.users table and auth.uid() function so migrations
-- can be validated without a full Supabase instance.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT COALESCE(current_setting('request.jwt.claim.sub', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
$$ LANGUAGE sql STABLE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
