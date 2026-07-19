/**
 * Notifications API Routes
 * 
 * Handles FCM token registration and in-app notification retrieval.
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── POST /notifications/fcm/register — Register a device FCM token ──────────
router.post('/fcm/register', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { token, device_type } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Upsert: if token already exists for user, update it
    const { data, error } = await supabaseAdmin
      .from('fcm_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_type: device_type || 'android',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /notifications/fcm/unregister — Remove a device FCM token ─────────
router.delete('/fcm/unregister', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const { error } = await supabaseAdmin
      .from('fcm_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Token unregistered' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /notifications — List in-app notifications for the user ──────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data, total: count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /notifications/unread-count — Get unread notification count ──────────
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ unread_count: count || 0 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /notifications/:id/read — Mark a notification as read ──────────────
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /notifications/read-all — Mark all notifications as read ───────────
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
