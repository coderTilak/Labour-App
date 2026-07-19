"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_customers: 0,
    total_workers: 0,
    total_companies: 0,
    pending_verifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/admin/stats/overview');
        setStats(res.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('No authorization') || errorMessage.includes('Invalid')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Global Overview</h1>
        <p className="text-slate-500 mt-2">High-level metrics and platform health for Labour Connect Nepal.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Customers</h2>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{loading ? '...' : stats.total_customers}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Independent Workers</h2>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{loading ? '...' : stats.total_workers}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Corporate Agencies</h2>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900">{loading ? '...' : stats.total_companies}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Verifications</h2>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-amber-600">{loading ? '...' : stats.pending_verifications}</span>
            <Link href="/super-admin/verifications" className="text-sm font-bold text-amber-700 hover:underline">Review &rarr;</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Platform Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm font-semibold text-teal-600 hover:text-teal-800">View All Log</button>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">System Online</p>
                <p className="text-sm text-slate-500">Super admin dashboard connected to live database.</p>
                <p className="text-xs text-slate-400 mt-1">Just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="bg-slate-900 rounded-xl shadow-md p-6 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Administrative Commands</h2>
            <p className="text-slate-400 text-sm mb-6">Access global overrides and system-wide operations.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-colors">
                <h3 className="font-bold">Global Broadcast</h3>
                <p className="text-xs text-slate-400 mt-1">Send a push notification to all users</p>
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-colors">
                <h3 className="font-bold">System Maintenance</h3>
                <p className="text-xs text-slate-400 mt-1">Toggle maintenance mode (Lock UI)</p>
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-colors">
                <h3 className="font-bold">Taxonomy Editor</h3>
                <p className="text-xs text-slate-400 mt-1">Manage job categories & trades</p>
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-colors">
                <h3 className="font-bold">Generate Reports</h3>
                <p className="text-xs text-slate-400 mt-1">Export weekly financial ledgers</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
