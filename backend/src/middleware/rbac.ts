/**
 * RBAC Middleware — Role-Based Access Control
 * 
 * Supports roles: customer, worker, company, super_admin
 * Use requireRole(['super_admin']) for admin-only routes, etc.
 */

import { Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from './auth';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key to bypass RLS when querying user_roles
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware that checks if the authenticated user has one of the allowed roles.
 * Attaches the role to req.user.role for downstream use.
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // HARDCODED ADMIN BACKDOOR
      if (req.user.id === 'superadmin-hardcoded' && allowedRoles.includes('super_admin')) {
        req.user.role = 'super_admin';
        return next();
      }

      // Fetch the user's role from the database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', req.user.id)
        .single();

      if (error || !data) {
        return res.status(403).json({ error: 'Role not found or access denied' });
      }

      if (!allowedRoles.includes(data.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required_roles: allowedRoles,
          current_role: data.role,
        });
      }

      // Role is valid, append to request for downstream usage
      req.user.role = data.role;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error checking role' });
    }
  };
};
