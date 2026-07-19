/**
 * Company — Branch Management Routes
 * 
 * Company Admin CRUD for spatial branch offices (plan.md §1.3).
 * Up to 5 branches per company (enforced by subscription tier).
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Helper: Get the company_profiles.id for the authenticated company admin user
 */
async function getCompanyId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('company_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

// ─── GET /company/branches — List all branches for this company ──────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('company_branches')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── POST /company/branches — Create a new branch ────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { branch_name, city, address, latitude, longitude, contact_no, manager_user_id } = req.body;

    if (!branch_name) {
      return res.status(400).json({ error: 'branch_name is required' });
    }

    // Check subscription branch limits
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:subscription_plans(max_branches)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (subscription && subscription.plan) {
      const maxBranches = subscription.plan.max_branches;
      if (maxBranches > 0) { // -1 means unlimited
        const { count: currentCount } = await supabaseAdmin
          .from('company_branches')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true);

        if ((currentCount || 0) >= maxBranches) {
          return res.status(403).json({
            error: `Branch limit reached (${maxBranches}). Upgrade your subscription to add more.`,
          });
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('company_branches')
      .insert({
        company_id: companyId,
        branch_name,
        city,
        address,
        latitude,
        longitude,
        contact_no,
        manager_user_id: manager_user_id || null,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /company/branches/:id — Update a branch ───────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { id } = req.params;
    const { branch_name, city, address, latitude, longitude, contact_no, manager_user_id, is_active } = req.body;

    const updatePayload: any = {};
    if (branch_name !== undefined) updatePayload.branch_name = branch_name;
    if (city !== undefined) updatePayload.city = city;
    if (address !== undefined) updatePayload.address = address;
    if (latitude !== undefined) updatePayload.latitude = latitude;
    if (longitude !== undefined) updatePayload.longitude = longitude;
    if (contact_no !== undefined) updatePayload.contact_no = contact_no;
    if (manager_user_id !== undefined) updatePayload.manager_user_id = manager_user_id;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('company_branches')
      .update(updatePayload)
      .eq('id', id)
      .eq('company_id', companyId) // Ensure ownership
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /company/branches/:id — Deactivate a branch ──────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { id } = req.params;

    // Soft delete
    const { data, error } = await supabaseAdmin
      .from('company_branches')
      .update({ is_active: false })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data, message: 'Branch deactivated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
