/**
 * Bookings API Routes
 * 
 * Handles creation, retrieval, status updates, and broadcast-based multi-provider requests.
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/auth';
import { sendBookingNotification } from '../services/fcm';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── POST /bookings — Create a new booking ────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user.id;
    const {
      provider_user_id,
      provider_type,
      category_id,
      title,
      description,
      service_address,
      service_latitude,
      service_longitude,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      estimated_cost,
      customer_notes,
    } = req.body;

    if (!provider_user_id || !provider_type) {
      return res.status(400).json({ error: 'provider_user_id and provider_type are required' });
    }

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_user_id,
        provider_type,
        category_id,
        title,
        description,
        service_address,
        service_latitude,
        service_longitude,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        estimated_cost,
        customer_notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Send FCM notification to the provider
    await sendBookingNotification(
      supabaseAdmin,
      provider_user_id,
      booking.id,
      'booking_new',
      'New Booking Request!',
      `You have a new ${title || 'service'} booking request.`
    );

    return res.status(201).json({ data: booking });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── POST /bookings/broadcast — Multi-provider broadcast (up to 10) ───────────
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user.id;
    const {
      provider_user_ids,
      category_id,
      title,
      description,
      service_address,
      service_latitude,
      service_longitude,
      scheduled_date,
      customer_notes,
    } = req.body;

    if (!provider_user_ids || !Array.isArray(provider_user_ids) || provider_user_ids.length === 0) {
      return res.status(400).json({ error: 'provider_user_ids must be a non-empty array' });
    }
    if (provider_user_ids.length > 10) {
      return res.status(400).json({ error: 'Cannot broadcast to more than 10 providers' });
    }

    // Create the base booking record
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_type: 'worker', // Broadcasts typically target individual workers
        category_id,
        title,
        description,
        service_address,
        service_latitude,
        service_longitude,
        scheduled_date,
        customer_notes,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      return res.status(500).json({ error: bookingError.message });
    }

    // Create broadcast records for each provider
    const broadcastRows = provider_user_ids.map((pid: string) => ({
      booking_id: booking.id,
      provider_user_id: pid,
      status: 'sent',
    }));

    const { error: broadcastError } = await supabaseAdmin
      .from('booking_broadcasts')
      .insert(broadcastRows);

    if (broadcastError) {
      return res.status(500).json({ error: broadcastError.message });
    }

    // Send FCM notifications to all targeted providers
    for (const providerId of provider_user_ids) {
      await sendBookingNotification(
        supabaseAdmin,
        providerId,
        booking.id,
        'broadcast_request',
        'New Job Broadcast!',
        `A customer near you is looking for ${title || 'a service'}. Tap to respond.`
      );
    }

    return res.status(201).json({ data: { booking, broadcast_count: provider_user_ids.length } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /bookings — List bookings for the authenticated user ─────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const status = req.query.status as string | undefined;

    let query = supabaseAdmin.from('bookings').select('*');

    // Filter by role
    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      query = query.eq('provider_user_id', userId);
    }

    // Optional status filter
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── GET /bookings/:id — Get a specific booking ──────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the user is a participant
    const userId = req.user.id;
    if (data.customer_id !== userId && data.provider_user_id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /bookings/:id/status — Update booking status ───────────────────────
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, provider_notes, assigned_employee_id, company_branch_id, cancellation_reason } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    // Fetch current booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Build update payload
    const updatePayload: any = { status };
    if (provider_notes) updatePayload.provider_notes = provider_notes;
    if (assigned_employee_id) updatePayload.assigned_employee_id = assigned_employee_id;
    if (company_branch_id) updatePayload.company_branch_id = company_branch_id;
    if (status === 'completed') updatePayload.completed_at = new Date().toISOString();
    if (status === 'cancelled') {
      updatePayload.cancelled_by = userId;
      updatePayload.cancellation_reason = cancellation_reason;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Send notification to the other party
    const notifyUserId = userId === booking.customer_id ? booking.provider_user_id : booking.customer_id;
    const statusMessages: Record<string, { type: string; title: string; body: string }> = {
      accepted: { type: 'booking_accepted', title: 'Booking Accepted!', body: 'Your booking has been accepted.' },
      assigned: { type: 'booking_assigned', title: 'Job Assigned', body: 'Your job has been assigned to a team member.' },
      worker_dispatched: { type: 'booking_dispatched', title: 'Worker On The Way', body: 'A worker has been dispatched to your location.' },
      in_progress: { type: 'booking_dispatched', title: 'Job Started', body: 'Your job is now in progress.' },
      completed: { type: 'booking_completed', title: 'Job Completed', body: 'The job has been marked as completed.' },
      cancelled: { type: 'booking_cancelled', title: 'Booking Cancelled', body: `Your booking has been cancelled.${cancellation_reason ? ' Reason: ' + cancellation_reason : ''}` },
      rejected: { type: 'booking_cancelled', title: 'Booking Declined', body: 'The provider has declined your booking request.' },
    };

    const msg = statusMessages[status];
    if (msg && notifyUserId) {
      await sendBookingNotification(supabaseAdmin, notifyUserId, id, msg.type, msg.title, msg.body);
    }

    return res.json({ data: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
