-- DEALWISE Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard -> SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credits table
CREATE TABLE IF NOT EXISTS credits (
  email TEXT PRIMARY KEY,
  credits INTEGER DEFAULT 5,
  total_used INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Analysis history
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT REFERENCES credits(email),
  contract_snippet TEXT,
  overall_score INTEGER,
  recommendation TEXT,
  nominal_rate REAL,
  effective_rate REAL,
  rate_reduction REAL,
  currency TEXT DEFAULT 'USD',
  contract_type TEXT,
  full_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract versions
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  contract_name TEXT,
  version_number INTEGER DEFAULT 1,
  analysis_id UUID REFERENCES analyses(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_plan ON credits(plan);

-- Disable RLS for simplicity (service role key bypasses anyway)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "service_role_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON credits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON admin_settings FOR ALL USING (true) WITH CHECK (true);
