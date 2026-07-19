-- ============================================================================
-- LABOUR CONNECT NEPAL — FULL PLATFORM SCHEMA EXPANSION
-- Migration 002: Subscriptions, Bookings, Branches, Employees, FCM, Admin
-- Run AFTER schema.sql and schema_updates.sql
-- ============================================================================

-- ─── 1. EXTEND user_roles TO SUPPORT super_admin ──────────────────────────────

-- Drop and recreate the check constraint to include 'super_admin'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('customer', 'worker', 'company', 'super_admin'));

-- ─── 2. SUPER ADMIN TABLE ─────────────────────────────────────────────────────
-- Separate table for additional super admin metadata beyond user_roles

CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  permissions JSONB DEFAULT '{"can_verify": true, "can_ban": true, "can_manage_categories": true, "can_audit_finances": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 3. SERVICE CATEGORIES (Super Admin Managed) ──────────────────────────────
-- Replaces hardcoded category lists in the frontend

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon_name TEXT,                               -- MaterialIcons icon identifier
  icon_family TEXT DEFAULT 'MaterialIcons',      -- Icon family (MaterialIcons, MaterialCommunityIcons)
  group_label TEXT,                              -- e.g., 'HOME & MAINTENANCE', 'CONSTRUCTION'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 4. SUBSCRIPTION PLANS ────────────────────────────────────────────────────
-- Static plan definitions matching plan.md §2.4

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,                     -- e.g., 'independent_pass', 'company_starter'
  display_name TEXT NOT NULL,                    -- e.g., 'Independent Labour Pass'
  target_role TEXT NOT NULL CHECK (target_role IN ('worker', 'company')),
  price_npr NUMERIC(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,                -- 30, 90, 365
  max_employees INTEGER DEFAULT 0,              -- 0 for worker plans
  max_branches INTEGER DEFAULT 0,               -- 0 for worker plans
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed the 4 subscription plans from plan.md
INSERT INTO public.subscription_plans (name, display_name, target_role, price_npr, duration_days, max_employees, max_branches)
VALUES
  ('independent_pass', 'Independent Labour Pass', 'worker', 499.00, 30, 0, 0),
  ('company_starter', 'Company Starter Tier', 'company', 2900.00, 30, 50, 2),
  ('company_growth', 'Company Growth Tier', 'company', 8900.00, 90, 150, 5),
  ('enterprise_fleet', 'Enterprise Fleet Transit', 'company', 35900.00, 365, -1, -1) -- -1 = unlimited
ON CONFLICT (name) DO NOTHING;

-- ─── 5. SUBSCRIPTIONS (Per-Provider) ──────────────────────────────────────────
-- Tracks trial status + active subscription state per worker/company

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'grace', 'expired', 'cancelled')),
  trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 days'),
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  grace_ends_at TIMESTAMP WITH TIME ZONE,         -- 3-day grace window after expiry
  payment_method TEXT,                              -- 'esewa', 'khalti', 'fonepay', 'bank_transfer'
  payment_reference TEXT,                           -- Transaction ID from payment gateway
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 6. ALTER EXISTING PROFILE TABLES ─────────────────────────────────────────

-- Worker profiles: add operational fields
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS availability_state TEXT DEFAULT 'offline' 
  CHECK (availability_state IN ('available', 'busy', 'offline'));
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected'));
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(8,2);
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(8,2);
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS belongs_to_company UUID REFERENCES public.company_profiles(id);

-- Company profiles: add operational fields
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected'));
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS pan_vat_number TEXT;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS registration_doc_url TEXT;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS availability_state TEXT DEFAULT 'available'
  CHECK (availability_state IN ('available', 'busy', 'offline'));

-- ─── 7. COMPANY BRANCHES ──────────────────────────────────────────────────────
-- Up to 5 branch offices per company (plan.md §1.3)

CREATE TABLE IF NOT EXISTS public.company_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE NOT NULL,
  branch_name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  manager_user_id UUID REFERENCES auth.users(id), -- Branch Manager credentials
  contact_no TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 8. COMPANY EMPLOYEES ─────────────────────────────────────────────────────
-- Workers belonging to a company (NOT independent, plan.md §1.3)

CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.company_branches(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  contact_no TEXT,
  email TEXT,
  skills TEXT[],
  profile_photo_url TEXT,
  id_document_url TEXT,
  availability_state TEXT DEFAULT 'available' CHECK (availability_state IN ('available', 'busy', 'offline')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 9. BOOKINGS ──────────────────────────────────────────────────────────────
-- Core booking records: customer → provider

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('worker', 'company')),
  provider_user_id UUID REFERENCES auth.users(id),         -- Worker or Company admin user
  company_branch_id UUID REFERENCES public.company_branches(id),
  assigned_employee_id UUID REFERENCES public.company_employees(id),
  category_id UUID REFERENCES public.categories(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Customer created, waiting for provider response
    'accepted',          -- Provider accepted
    'assigned',          -- Company admin assigned to branch/employee
    'worker_dispatched', -- Worker is on the way
    'in_progress',       -- Job actively being performed
    'completed',         -- Job finished
    'cancelled',         -- Cancelled by either party
    'rejected'           -- Provider declined
  )),
  title TEXT,
  description TEXT,
  service_address TEXT,
  service_latitude DOUBLE PRECISION,
  service_longitude DOUBLE PRECISION,
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_cost NUMERIC(10,2),
  final_cost NUMERIC(10,2),
  customer_notes TEXT,
  provider_notes TEXT,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 10. BOOKING BROADCASTS ───────────────────────────────────────────────────
-- Multi-provider request system (up to 10 providers, plan.md §3.4)

CREATE TABLE IF NOT EXISTS public.booking_broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'auto_cancelled')),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 11. FCM DEVICE TOKENS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('android', 'ios', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ─── 12. NOTIFICATIONS (In-App Log) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_by UUID REFERENCES auth.users(id),         -- NULL for auto-generated, user_id for admin-sent
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL CHECK (type IN (
    -- (a) Super Admin manually sent notifications
    'admin_broadcast',    -- Super Admin → all users of a role (or all)
    'admin_direct',       -- Super Admin → specific individual user
    -- (b) Automatic booking-triggered notifications
    'booking_new',        -- New booking request
    'booking_accepted',   -- Provider accepted
    'booking_assigned',   -- Company assigned to employee
    'booking_dispatched', -- Worker on the way
    'booking_completed',  -- Job completed
    'booking_cancelled',  -- Booking cancelled
    'broadcast_request',  -- Multi-provider broadcast
    -- System auto-triggered notifications
    'verification_update',-- Verification status changed
    'subscription_alert', -- Trial/subscription expiry warning
    'review_received',    -- New review on profile
    'system'              -- System announcements
  )),
  data JSONB DEFAULT '{}'::jsonb,    -- Additional payload (booking_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 13. VERIFICATION REQUESTS ────────────────────────────────────────────────
-- Document upload queue for Super Admin review (plan.md §1.4)

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('worker', 'company')),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'citizenship', 'national_id', 'selfie', 'pan_vat', 'company_registration'
  )),
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 14. REVIEWS ──────────────────────────────────────────────────────────────
-- Customer star ratings + text reviews (plan.md §1.1)

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_flagged BOOLEAN DEFAULT false,                -- Super admin moderation flag
  flagged_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TIMESTAMP TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON public.super_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_branches_updated_at BEFORE UPDATE ON public.company_branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_employees_updated_at BEFORE UPDATE ON public.company_employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fcm_tokens_updated_at BEFORE UPDATE ON public.fcm_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ── Categories: public read, super_admin write ──
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ── Subscription Plans: public read ──
CREATE POLICY "plans_read_all" ON public.subscription_plans FOR SELECT USING (true);

-- ── Subscriptions: users read own, service_role manages ──
CREATE POLICY "subscriptions_read_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- ── Company Branches: company owner manages ──
CREATE POLICY "branches_read_own_company" ON public.company_branches FOR SELECT USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "branches_insert_own_company" ON public.company_branches FOR INSERT WITH CHECK (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "branches_update_own_company" ON public.company_branches FOR UPDATE USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "branches_delete_own_company" ON public.company_branches FOR DELETE USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);

-- ── Company Employees: company owner manages ──
CREATE POLICY "employees_read_own_company" ON public.company_employees FOR SELECT USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "employees_insert_own_company" ON public.company_employees FOR INSERT WITH CHECK (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "employees_update_own_company" ON public.company_employees FOR UPDATE USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "employees_delete_own_company" ON public.company_employees FOR DELETE USING (
  company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);

-- ── Bookings: participants can read, customer creates ──
CREATE POLICY "bookings_read_participant" ON public.bookings FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = provider_user_id
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "bookings_insert_customer" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_update_participant" ON public.bookings FOR UPDATE USING (
  auth.uid() = customer_id OR auth.uid() = provider_user_id
);

-- ── Booking Broadcasts: provider reads own, customer creates ──
CREATE POLICY "broadcasts_read_own" ON public.booking_broadcasts FOR SELECT USING (
  auth.uid() = provider_user_id
  OR EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid())
);
CREATE POLICY "broadcasts_insert" ON public.booking_broadcasts FOR INSERT WITH CHECK (true);
CREATE POLICY "broadcasts_update_provider" ON public.booking_broadcasts FOR UPDATE USING (
  auth.uid() = provider_user_id
);

-- ── FCM Tokens: users manage own ──
CREATE POLICY "fcm_read_own" ON public.fcm_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fcm_insert_own" ON public.fcm_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fcm_update_own" ON public.fcm_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "fcm_delete_own" ON public.fcm_tokens FOR DELETE USING (auth.uid() = user_id);

-- ── Notifications: users read own ──
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── Verification Requests: user reads own, super_admin reads all ──
CREATE POLICY "verification_read_own" ON public.verification_requests FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "verification_insert_own" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verification_update_admin" ON public.verification_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ── Reviews: public read, customer writes ──
CREATE POLICY "reviews_read_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_customer" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reviews_update_admin" ON public.reviews FOR UPDATE USING (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ── Super Admins: super_admin reads own ──
CREATE POLICY "super_admins_read_own" ON public.super_admins FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_booking ON public.booking_broadcasts(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_workers_category ON public.worker_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_workers_location ON public.worker_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_company_location ON public.company_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_employees_company ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_branches_company ON public.company_branches(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON public.reviews(provider_user_id);
