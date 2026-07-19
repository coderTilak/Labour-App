/**
 * Admin — Categories Management Routes
 * 
 * Super Admin manages the global service category taxonomy (plan.md §1.4).
 * Prevents duplicate entries (e.g., "AC Mechanic" vs "AC Installer").
 */

import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── GET /admin/categories — List all categories ─────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';

    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .order('group_label', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
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

// ─── POST /admin/categories — Create a new category ──────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, display_name, icon_name, icon_family, group_label, sort_order } = req.body;

    if (!name || !display_name) {
      return res.status(400).json({ error: 'name and display_name are required' });
    }

    // Check for duplicates (case-insensitive)
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id, name, display_name')
      .ilike('name', name);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: `Category with similar name already exists: "${existing[0].display_name}"`,
        existing: existing[0],
      });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: name.toLowerCase().replace(/\s+/g, '_'),
        display_name,
        icon_name: icon_name || null,
        icon_family: icon_family || 'MaterialIcons',
        group_label: group_label || null,
        sort_order: sort_order || 0,
        created_by: req.user.id,
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

// ─── PATCH /admin/categories/:id — Update a category ─────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { display_name, icon_name, icon_family, group_label, sort_order, is_active } = req.body;

    const updatePayload: any = {};
    if (display_name !== undefined) updatePayload.display_name = display_name;
    if (icon_name !== undefined) updatePayload.icon_name = icon_name;
    if (icon_family !== undefined) updatePayload.icon_family = icon_family;
    if (group_label !== undefined) updatePayload.group_label = group_label;
    if (sort_order !== undefined) updatePayload.sort_order = sort_order;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
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

// ─── DELETE /admin/categories/:id — Soft-delete a category ───────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete: set is_active = false
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data, message: 'Category deactivated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
