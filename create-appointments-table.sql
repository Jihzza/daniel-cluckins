-- Enhanced MCP integration database schema
-- Run this in your Supabase SQL editor

-- 1. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (45, 60, 75, 90, 105, 120)),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'Confirmed',
  stripe_payment_id TEXT,
  appointment_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('basic', 'standard', 'premium')),
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_payment_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PITCH REQUESTS TABLE
CREATE TABLE IF NOT EXISTS pitch_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project TEXT NOT NULL CHECK (project IN ('GalowClub', 'Perspectiv')),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  status TEXT DEFAULT 'submitted',
  file_url TEXT,
  notification_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(appointment_start);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_pitch_requests_user_id ON pitch_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_requests_project ON pitch_requests(project);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_requests ENABLE ROW LEVEL SECURITY;

-- APPOINTMENTS POLICIES
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- PITCH REQUESTS POLICIES
CREATE POLICY "Users can view own pitch requests" ON pitch_requests
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert pitch requests" ON pitch_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own pitch requests" ON pitch_requests
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
