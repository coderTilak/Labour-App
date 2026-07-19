/**
 * Admin — User Management Routes
 * 
 * Super Admin can list all users, view details, ban/unban accounts,
 * and delete flagged reviews (plan.md §1.4).
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── GET /admin/users — List all users with their roles ───────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = supabaseAdmin
      .from('user_roles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: roles, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Enrich with profile data
    const enriched = await Promise.all(
      (roles || []).map(async (r: any) => {
        let profile = null;
        if (r.role === 'customer') {
          const { data } = await supabaseAdmin
            .from('customer_profiles')
            .select('full_name, email, city, contact_no')
            .eq('user_id', r.user_id)
            .single();
          profile = data;
        } else if (r.role === 'worker') {
          const { data } = await supabaseAdmin
            .from('worker_profiles')
            .select('full_name, email, city, contact_no, verification_status, availability_state')
            .eq('user_id', r.user_id)
            .single();
          profile = data;
        } else if (r.role === 'company') {
          const { data } = await supabaseAdmin
            .from('company_profiles')
            .select('company_name, email, city, contact_no, verification_status')
            .eq('user_id', r.user_id)
            .single();
          profile = data;
        }
        return { ...r, profile };
      })
    );

    return res.json({ data: enriched, total: count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /admin/users/:userId — Get detailed user info ────────────────────────
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Get role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get profile based on role
    let profile = null;
    const profileTable =
      roleData.role === 'customer'
        ? 'customer_profiles'
        : roleData.role === 'worker'
        ? 'worker_profiles'
        : 'company_profiles';

    const { data: profileData } = await supabaseAdmin
      .from(profileTable)
      .select('*')
      .eq('user_id', userId)
      .single();

    profile = profileData;

    // Get subscription info (for workers/companies)
    let subscription = null;
    if (roleData.role !== 'customer') {
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      subscription = subData;
    }

    // Get verification requests
    const { data: verifications } = await supabaseAdmin
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    // Get recent bookings
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .or(`customer_id.eq.${userId},provider_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({
      data: {
        role: roleData,
        profile,
        subscription,
        verifications,
        recent_bookings: bookings,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /admin/users/:userId/ban — Ban or unban a user ─────────────────────
router.patch('/:userId/ban', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { is_banned, reason } = req.body;

    if (typeof is_banned !== 'boolean') {
      return res.status(400).json({ error: 'is_banned (boolean) is required' });
    }

    // Use Supabase Admin API to ban/unban user
    if (is_banned) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none', // Permanent ban until manually lifted
        user_metadata: { banned_reason: reason || 'Violated platform terms' },
      });
      if (error) return res.status(500).json({ error: error.message });
    } else {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
        user_metadata: { banned_reason: null },
      });
      if (error) return res.status(500).json({ error: error.message });
    }

    return res.json({
      message: is_banned ? 'User has been banned' : 'User has been unbanned',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /admin/stats — Platform-wide statistics ──────────────────────────────
router.get('/stats/overview', async (req: AuthRequest, res: Response) => {
  try {
    const [
      { count: totalCustomers },
      { count: totalWorkers },
      { count: totalCompanies },
      { count: totalBookings },
      { count: pendingVerifications },
      { count: activeSubscriptions },
    ] = await Promise.all([
      supabaseAdmin.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseAdmin.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'worker'),
      supabaseAdmin.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'company'),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    return res.json({
      data: {
        total_customers: totalCustomers || 0,
        total_workers: totalWorkers || 0,
        total_companies: totalCompanies || 0,
        total_bookings: totalBookings || 0,
        pending_verifications: pendingVerifications || 0,
        active_subscriptions: activeSubscriptions || 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
