/**
 * Admin — Verification Queue Routes
 * 
 * Super Admin reviews uploaded business documents, IDs, and selfies
 * to flag provider accounts as "Verified" (plan.md §1.4).
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../../middleware/auth';
import { sendBookingNotification } from '../../services/fcm';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── GET /admin/verifications — List all pending verification requests ────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error, count } = await supabaseAdmin
      .from('verification_requests')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('submitted_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data, total: count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /admin/verifications/:id — Approve or reject a verification ────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;
    const reviewerId = req.user.id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
    }

    // Get the verification request
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('verification_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // Update the verification request
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('verification_requests')
      .update({
        status,
        reviewed_by: reviewerId,
        review_notes: review_notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // If approved, update the provider's verification_status
    if (status === 'approved') {
      const profileTable = request.user_role === 'worker' ? 'worker_profiles' : 'company_profiles';
      await supabaseAdmin
        .from(profileTable)
        .update({ verification_status: 'approved' })
        .eq('user_id', request.user_id);
    }

    // Notify the provider
    await sendBookingNotification(
      supabaseAdmin,
      request.user_id,
      id,
      'verification_update',
      status === 'approved' ? 'Verification Approved! ✅' : 'Verification Update',
      status === 'approved'
        ? 'Your identity documents have been verified. Your profile is now marked as verified.'
        : `Your verification was declined.${review_notes ? ' Note: ' + review_notes : ''}`
    );

    return res.json({ data: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
