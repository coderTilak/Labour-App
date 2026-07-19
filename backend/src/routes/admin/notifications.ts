/**
 * Admin — Notification Management Routes
 * 
 * Super Admin can send notifications to:
 * (a) Individual users (admin_direct)
 * (b) All users of a specific role — customer, worker, company (admin_broadcast)
 * (c) All platform users at once (admin_broadcast to all roles)
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../../middleware/auth';
import { sendToDevice, sendToMultipleDevices } from '../../services/fcm';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── POST /admin/notifications/send — Send to a specific user ─────────────────
router.post('/send', async (req: AuthRequest, res: Response) => {
  try {
    const adminUserId = req.user.id;
    const { user_id, title, body, data } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ error: 'user_id and title are required' });
    }

    // 1. Store the in-app notification
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        sent_by: adminUserId,
        title,
        body: body || '',
        type: 'admin_direct',
        data: data || {},
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // 2. Send FCM push notification to all user devices
    const { data: tokens } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', user_id)
      .eq('is_active', true);

    let pushResult = { successCount: 0, failureCount: 0 };
    if (tokens && tokens.length > 0) {
      const deviceTokens = tokens.map((t: any) => t.token);
      if (deviceTokens.length === 1) {
        const sent = await sendToDevice(deviceTokens[0], title, body || '', {
          type: 'admin_direct',
          notification_id: notification.id,
          ...(data || {}),
        });
        pushResult = { successCount: sent ? 1 : 0, failureCount: sent ? 0 : 1 };
      } else {
        pushResult = await sendToMultipleDevices(deviceTokens, title, body || '', {
          type: 'admin_direct',
          notification_id: notification.id,
          ...(data || {}),
        });
      }
    }

    return res.status(201).json({
      data: notification,
      push: pushResult,
      message: `Notification sent to user.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── POST /admin/notifications/broadcast — Send to all users of a role ────────
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
  try {
    const adminUserId = req.user.id;
    const { target_role, title, body, data } = req.body;

    // target_role: 'customer' | 'worker' | 'company' | 'all'
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const validRoles = ['customer', 'worker', 'company', 'all'];
    if (target_role && !validRoles.includes(target_role)) {
      return res.status(400).json({
        error: `target_role must be one of: ${validRoles.join(', ')}`,
      });
    }

    // 1. Get all user IDs for the target role
    let userQuery = supabaseAdmin.from('user_roles').select('user_id');
    if (target_role && target_role !== 'all') {
      userQuery = userQuery.eq('role', target_role);
    }

    const { data: roleUsers, error: roleError } = await userQuery;

    if (roleError) {
      return res.status(500).json({ error: roleError.message });
    }

    if (!roleUsers || roleUsers.length === 0) {
      return res.status(200).json({
        message: 'No users found for the specified role.',
        recipients: 0,
      });
    }

    const userIds = roleUsers.map((r: any) => r.user_id);

    // 2. Batch-insert in-app notifications for all target users
    const notificationRows = userIds.map((uid: string) => ({
      user_id: uid,
      sent_by: adminUserId,
      title,
      body: body || '',
      type: 'admin_broadcast' as const,
      data: {
        target_role: target_role || 'all',
        ...(data || {}),
      },
    }));

    // Insert in batches of 500 to avoid payload limits
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    for (let i = 0; i < notificationRows.length; i += BATCH_SIZE) {
      const batch = notificationRows.slice(i, i + BATCH_SIZE);
      const { error: batchError } = await supabaseAdmin
        .from('notifications')
        .insert(batch);

      if (batchError) {
        console.error(`[Admin Broadcast] Batch insert error at offset ${i}:`, batchError.message);
      } else {
        totalInserted += batch.length;
      }
    }

    // 3. Send FCM push notifications to all target user devices
    const { data: allTokens } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token, user_id')
      .in('user_id', userIds)
      .eq('is_active', true);

    let pushResult = { successCount: 0, failureCount: 0 };
    if (allTokens && allTokens.length > 0) {
      const deviceTokens = allTokens.map((t: any) => t.token);

      // FCM sendEachForMulticast supports max 500 tokens at a time
      for (let i = 0; i < deviceTokens.length; i += 500) {
        const tokenBatch = deviceTokens.slice(i, i + 500);
        const result = await sendToMultipleDevices(tokenBatch, title, body || '', {
          type: 'admin_broadcast',
          target_role: target_role || 'all',
          ...(data || {}),
        });
        pushResult.successCount += result.successCount;
        pushResult.failureCount += result.failureCount;
      }
    }

    return res.status(201).json({
      message: `Broadcast sent to ${totalInserted} ${target_role || 'all'} users.`,
      recipients: totalInserted,
      push: pushResult,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /admin/notifications/history — View sent admin notifications ─────────
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string | undefined; // 'admin_direct' | 'admin_broadcast'

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .not('sent_by', 'is', null) // Only admin-sent notifications
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Deduplicate broadcasts (they create N rows — one per user)
    // Group by title + created_at (within 1-second window) for broadcast summaries
    const seen = new Map<string, any>();
    const deduplicated: any[] = [];

    for (const notif of data || []) {
      if (notif.type === 'admin_broadcast') {
        const key = `${notif.title}|${notif.sent_by}|${notif.created_at?.substring(0, 19)}`;
        if (!seen.has(key)) {
          seen.set(key, true);
          deduplicated.push({
            ...notif,
            _is_broadcast_summary: true,
          });
        }
      } else {
        deduplicated.push(notif);
      }
    }

    return res.json({ data: deduplicated, total_rows: count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
