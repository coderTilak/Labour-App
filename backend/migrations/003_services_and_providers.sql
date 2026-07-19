-- ============================================================================
-- LABOUR CONNECT NEPAL — MVP SERVICES & PROVIDER SERVICES MAPPING
-- Migration 003: 
-- Run AFTER 002_full_platform_schema.sql
-- ============================================================================

-- ─── 1. PROVIDER SERVICES (Junction Table) ────────────────────────────────────
-- Links worker or company profiles to the categories (services) they offer.

CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('worker', 'company')),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_user_id, category_id)
);

-- Enable RLS
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

-- Policies for provider_services
CREATE POLICY "provider_services_read_all" ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "provider_services_insert_own" ON public.provider_services FOR INSERT WITH CHECK (auth.uid() = provider_user_id);
CREATE POLICY "provider_services_delete_own" ON public.provider_services FOR DELETE USING (auth.uid() = provider_user_id);
-- Super admin policies
CREATE POLICY "provider_services_insert_admin" ON public.provider_services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "provider_services_delete_admin" ON public.provider_services FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);


-- ─── 2. SEED MVP CATEGORIES (SERVICES) ────────────────────────────────────────

-- We use ON CONFLICT (name) DO NOTHING to prevent errors if run multiple times.
-- Note: 'categories' table has UNIQUE(name).

INSERT INTO public.categories (name, display_name, group_label, icon_name, icon_family)
VALUES 
  -- 🏠 Home Services
  ('electrician', 'Electrician', 'Home Services', 'electrical-services', 'MaterialIcons'),
  ('plumber', 'Plumber', 'Home Services', 'plumbing', 'MaterialIcons'),
  ('carpenter', 'Carpenter', 'Home Services', 'handyman', 'MaterialIcons'),
  ('painter', 'Painter', 'Home Services', 'format-paint', 'MaterialIcons'),
  ('mason', 'Mason', 'Home Services', 'architecture', 'MaterialIcons'),
  ('welder', 'Welder', 'Home Services', 'hardware', 'MaterialIcons'),
  ('tile_installation', 'Tile Installation', 'Home Services', 'grid-on', 'MaterialIcons'),
  ('glass_aluminum_work', 'Glass & Aluminum Work', 'Home Services', 'window', 'MaterialIcons'),
  ('locksmith', 'Locksmith', 'Home Services', 'vpn-key', 'MaterialIcons'),
  
  -- 🔧 Repair & Maintenance
  ('ac_repair', 'AC Repair', 'Repair & Maintenance', 'hvac', 'MaterialIcons'),
  ('refrigerator_repair', 'Refrigerator Repair', 'Repair & Maintenance', 'kitchen', 'MaterialIcons'),
  ('washing_machine_repair', 'Washing Machine Repair', 'Repair & Maintenance', 'local-laundry-service', 'MaterialIcons'),
  ('tv_repair', 'TV Repair', 'Repair & Maintenance', 'tv', 'MaterialIcons'),

  -- 🧹 Cleaning Services
  ('house_cleaning', 'House Cleaning', 'Cleaning Services', 'cleaning-services', 'MaterialIcons'),
  ('office_cleaning', 'Office Cleaning', 'Cleaning Services', 'business', 'MaterialIcons'),
  ('water_tank_cleaning', 'Water Tank Cleaning', 'Cleaning Services', 'water-drop', 'MaterialIcons'),
  ('pest_control', 'Pest Control', 'Cleaning Services', 'pest-control', 'MaterialIcons'),

  -- 🖥️ IT & Security
  ('cctv_installation', 'CCTV Installation', 'IT & Security', 'videocam', 'MaterialIcons'),
  ('computer_repair', 'Computer Repair', 'IT & Security', 'computer', 'MaterialIcons'),
  ('wifi_setup', 'Internet/Wi-Fi Setup', 'IT & Security', 'wifi', 'MaterialIcons'),

  -- 🚚 Moving & Transport
  ('house_shifting', 'House Shifting', 'Moving & Transport', 'local-shipping', 'MaterialIcons'),
  ('packers_and_movers', 'Packers & Movers', 'Moving & Transport', 'inventory', 'MaterialIcons'),

  -- 🌳 Outdoor Services
  ('gardening', 'Gardening', 'Outdoor Services', 'yard', 'MaterialIcons'),

  -- 🪑 Furniture Services
  ('furniture_repair', 'Furniture Repair', 'Furniture Services', 'chair', 'MaterialIcons'),

  -- 🏗️ Construction
  ('interior_renovation', 'Interior Renovation', 'Construction', 'foundation', 'MaterialIcons')

ON CONFLICT (name) DO NOTHING;
