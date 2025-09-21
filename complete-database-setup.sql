-- Complete database setup for MCP integration
-- Run this in your Supabase SQL editor

-- 1. DROP existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS pitch_requests CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- 2. CREATE APPOINTMENTS TABLE
CREATE TABLE appointments (
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

-- 3. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions (
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

-- 4. CREATE PITCH REQUESTS TABLE
CREATE TABLE pitch_requests (
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

-- 5. CREATE INDEXES
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start ON appointments(appointment_start);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_pitch_requests_user_id ON pitch_requests(user_id);
CREATE INDEX idx_pitch_requests_project ON pitch_requests(project);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_requests ENABLE ROW LEVEL SECURITY;

-- 7. DROP existing policies if they exist
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view own pitch requests" ON pitch_requests;
DROP POLICY IF EXISTS "Users can insert pitch requests" ON pitch_requests;
DROP POLICY IF EXISTS "Users can update own pitch requests" ON pitch_requests;

-- 8. CREATE RLS POLICIES

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

-- 9. TEST THE SETUP
-- Test insert for pitch_requests
INSERT INTO pitch_requests (project, user_id, name, email, phone, role, status)
VALUES ('GalowClub', 'test-user-id', 'Test User', 'test@example.com', '123456789', 'Developer', 'submitted');

-- Test insert for subscriptions
INSERT INTO subscriptions (user_id, plan_id, status)
VALUES ('test-user-id', 'premium', 'active');

-- Test insert for appointments
INSERT INTO appointments (user_id, duration_minutes, contact_name, contact_email, appointment_start)
VALUES ('test-user-id', 60, 'Test User', 'test@example.com', NOW() + INTERVAL '1 day');

-- Clean up test data
DELETE FROM pitch_requests WHERE user_id = 'test-user-id';
DELETE FROM subscriptions WHERE user_id = 'test-user-id';
DELETE FROM appointments WHERE user_id = 'test-user-id';

-- 10. VERIFY TABLES EXIST
SELECT table_name, column_name, is_nullable, data_type
FROM information_schema.columns 
WHERE table_name IN ('appointments', 'subscriptions', 'pitch_requests')
ORDER BY table_name, ordinal_position;
