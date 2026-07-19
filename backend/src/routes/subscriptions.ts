/**
 * Subscriptions API Routes
 * 
 * Handles subscription status checks, plan listing, and subscription activation.
 * Implements the 15-day trial + 3-day grace window from plan.md §2.
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── GET /subscriptions/plans — List available subscription plans ─────────────
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const role = req.query.role as string | undefined;

    let query = supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_npr', { ascending: true });

    if (role) {
      query = query.eq('target_role', role);
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

// ─── GET /subscriptions/status — Check current subscription state ─────────────
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      // No subscription record — check if user profile was recently created (auto-trial)
      return res.json({
        data: {
          status: 'no_subscription',
          is_eligible_for_feed: false,
          message: 'No subscription found. Create a provider profile to start your 15-day trial.',
        },
      });
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const subscriptionEnd = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null;
    const graceEnd = subscription.grace_ends_at ? new Date(subscription.grace_ends_at) : null;

    let computedStatus = subscription.status;
    let isEligibleForFeed = false;
    let message = '';

    // Trial check
    if (subscription.status === 'trial') {
      if (now <= trialEnd) {
        isEligibleForFeed = true;
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        message = `Trial active. ${daysLeft} days remaining.`;
      } else {
        computedStatus = 'expired';
        message = 'Trial expired. Subscribe to continue.';
      }
    }
    // Active subscription check
    else if (subscription.status === 'active' && subscriptionEnd) {
      if (now <= subscriptionEnd) {
        isEligibleForFeed = true;
        const daysLeft = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        message = `Subscription active. ${daysLeft} days remaining.`;
      } else {
        // Subscription expired — enter grace period
        computedStatus = 'grace';
        const graceEndDate = new Date(subscriptionEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
        if (now <= graceEndDate) {
          isEligibleForFeed = false; // Hidden from feed per plan.md §2.3
          const graceHoursLeft = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          message = `Grace period. ${graceHoursLeft} hours to renew. Profile hidden from marketplace.`;
        } else {
          computedStatus = 'expired';
          message = 'Subscription and grace period expired. Account locked.';
        }
      }
    }
    // Grace period check
    else if (subscription.status === 'grace' && graceEnd) {
      if (now <= graceEnd) {
        isEligibleForFeed = false;
        message = 'Grace period active. Profile hidden from marketplace. Renew to restore.';
      } else {
        computedStatus = 'expired';
        message = 'Grace period ended. Account locked.';
      }
    }

    // Update status in DB if it changed
    if (computedStatus !== subscription.status) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: computedStatus })
        .eq('id', subscription.id);
    }

    return res.json({
      data: {
        ...subscription,
        status: computedStatus,
        is_eligible_for_feed: isEligibleForFeed,
        message,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── POST /subscriptions/activate — Activate a subscription plan ──────────────
router.post('/activate', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { plan_id, payment_method, payment_reference } = req.body;

    if (!plan_id || !payment_method || !payment_reference) {
      return res.status(400).json({
        error: 'plan_id, payment_method, and payment_reference are required',
      });
    }

    // Verify plan exists
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);
    const graceEndsAt = new Date(endsAt.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Upsert subscription record
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          plan_id,
          status: 'active',
          subscription_started_at: now.toISOString(),
          subscription_ends_at: endsAt.toISOString(),
          grace_ends_at: graceEndsAt.toISOString(),
          payment_method,
          payment_reference,
          updated_at: now.toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subError) {
      return res.status(500).json({ error: subError.message });
    }

    return res.status(200).json({
      data: subscription,
      message: `${plan.display_name} activated until ${endsAt.toLocaleDateString()}.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
