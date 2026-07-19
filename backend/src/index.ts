/**
 * Labour Connect Nepal — Backend API Server
 * 
 * Express server with modular route architecture:
 * - /api/bookings       — Booking management (all roles)
 * - /api/notifications  — FCM tokens + in-app notifications (all roles)
 * - /api/subscriptions  — Subscription status & activation (worker, company)
 * - /api/admin/*        — Super Admin routes (verification, users, categories)
 * - /api/company/*      — Company Admin routes (employees, branches)
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Load environment variables immediately so other modules can use them
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Middleware
import { requireAuth } from './middleware/auth';
import { requireRole } from './middleware/rbac';

// Services
import { initializeFirebase } from './services/fcm';

// Route modules
import adminCategoriesRoutes from './routes/admin/categories';
import adminNotificationsRoutes from './routes/admin/notifications';
import adminUsersRoutes from './routes/admin/users';
import adminVerificationRoutes from './routes/admin/verification';
import bookingsRoutes from './routes/bookings';
import companyBranchesRoutes from './routes/company/branches';
import companyEmployeesRoutes from './routes/company/employees';
import notificationsRoutes from './routes/notifications';
import subscriptionsRoutes from './routes/subscriptions';

const app = express();
const port = process.env.PORT || 3005;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Initialize Supabase Admin Client ─────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ─── Initialize Firebase (graceful — won't crash if not configured) ───────────
initializeFirebase();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseInitialized: !!supabaseAdmin,
    version: '2.0.0',
  });
});

// ─── Public Routes (no auth required) ─────────────────────────────────────────

// GET /api/categories — Public category listing (no auth needed)
app.get('/api/categories', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('group_label')
    .order('sort_order');

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

// GET /api/subscription-plans — Public plan listing
app.get('/api/subscription-plans', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }
  const role = req.query.role as string | undefined;
  let query = supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_npr');

  if (role) query = query.eq('target_role', role);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

// ─── Authenticated Routes ─────────────────────────────────────────────────────

// Bookings — accessible by customer, worker, company
app.use(
  '/api/bookings',
  requireAuth,
  requireRole(['customer', 'worker', 'company', 'super_admin']),
  bookingsRoutes
);

// Notifications — accessible by all authenticated users
app.use(
  '/api/notifications',
  requireAuth,
  notificationsRoutes
);

// Subscriptions — accessible by workers and companies
app.use(
  '/api/subscriptions',
  requireAuth,
  requireRole(['worker', 'company', 'super_admin']),
  subscriptionsRoutes
);

// ─── Super Admin Routes ───────────────────────────────────────────────────────

app.use(
  '/api/admin/verifications',
  requireAuth,
  requireRole(['super_admin']),
  adminVerificationRoutes
);

app.use(
  '/api/admin/users',
  requireAuth,
  requireRole(['super_admin']),
  adminUsersRoutes
);

app.use(
  '/api/admin/categories',
  requireAuth,
  requireRole(['super_admin']),
  adminCategoriesRoutes
);

app.use(
  '/api/admin/notifications',
  requireAuth,
  requireRole(['super_admin']),
  adminNotificationsRoutes
);

// ─── Company Admin Routes ─────────────────────────────────────────────────────

app.use(
  '/api/company/employees',
  requireAuth,
  requireRole(['company']),
  companyEmployeesRoutes
);

app.use(
  '/api/company/branches',
  requireAuth,
  requireRole(['company']),
  companyBranchesRoutes
);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀 Labour Connect Nepal API Server`);
  console.log(`   Running on: http://localhost:${port}`);
  console.log(`   Health:     http://localhost:${port}/health`);
  console.log(`   Supabase:   ${supabaseAdmin ? '✅ Connected' : '❌ Not configured'}`);
  console.log('');
});

