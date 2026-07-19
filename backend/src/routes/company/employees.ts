/**
 * Company — Employee Management Routes
 * 
 * Company Admin CRUD for internal employee accounts (plan.md §1.3).
 * Workers belonging to a company CANNOT sign up independently.
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

// ─── GET /company/employees — List all employees for this company ─────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const branchId = req.query.branch_id as string | undefined;
    const activeOnly = req.query.active !== 'false';

    let query = supabaseAdmin
      .from('company_employees')
      .select('*, branch:company_branches(id, branch_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── POST /company/employees — Add a new employee ────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { full_name, contact_no, email, skills, branch_id, profile_photo_url, id_document_url } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'full_name is required' });
    }

    // Check subscription employee limits
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:subscription_plans(max_employees)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (subscription && subscription.plan) {
      const maxEmployees = subscription.plan.max_employees;
      if (maxEmployees > 0) { // -1 means unlimited
        const { count: currentCount } = await supabaseAdmin
          .from('company_employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true);

        if ((currentCount || 0) >= maxEmployees) {
          return res.status(403).json({
            error: `Employee limit reached (${maxEmployees}). Upgrade your subscription to add more.`,
          });
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('company_employees')
      .insert({
        company_id: companyId,
        branch_id: branch_id || null,
        full_name,
        contact_no,
        email,
        skills: skills || [],
        profile_photo_url,
        id_document_url,
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

// ─── PATCH /company/employees/:id — Update an employee ───────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { id } = req.params;
    const { full_name, contact_no, email, skills, branch_id, availability_state, is_active, profile_photo_url } = req.body;

    const updatePayload: any = {};
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (contact_no !== undefined) updatePayload.contact_no = contact_no;
    if (email !== undefined) updatePayload.email = email;
    if (skills !== undefined) updatePayload.skills = skills;
    if (branch_id !== undefined) updatePayload.branch_id = branch_id;
    if (availability_state !== undefined) updatePayload.availability_state = availability_state;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (profile_photo_url !== undefined) updatePayload.profile_photo_url = profile_photo_url;

    const { data, error } = await supabaseAdmin
      .from('company_employees')
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

// ─── DELETE /company/employees/:id — Remove an employee ──────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const { id } = req.params;

    // Soft delete: set is_active = false
    const { data, error } = await supabaseAdmin
      .from('company_employees')
      .update({ is_active: false })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data, message: 'Employee deactivated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
