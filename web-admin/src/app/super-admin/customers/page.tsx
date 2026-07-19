"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface CustomerProfile {
  full_name?: string;
  email?: string;
  city?: string;
  contact_no?: string;
}

interface UserRole {
  id: number;
  user_id: string;
  role: string;
  created_at: string;
  profile?: CustomerProfile;
}

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const result = await apiFetch('/admin/users?role=customer');
        setCustomers(result.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('No authorization') || errorMessage.includes('Invalid')) {
          router.push('/login');
        } else {
          setError(errorMessage || 'Failed to load customers');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers Directory</h1>
          <p className="text-slate-500 mt-2">Manage all registered customer accounts on the platform.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <input 
            type="text" 
            placeholder="Search customers by name, phone, or ID..." 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-600 text-sm">
                  <th className="py-4 px-6 font-semibold">User ID</th>
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Phone</th>
                  <th className="py-4 px-6 font-semibold">City</th>
                  <th className="py-4 px-6 font-semibold">Joined Date</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.user_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-500 text-sm">{customer.user_id.substring(0, 8)}...</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{customer.profile?.full_name || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">{customer.profile?.contact_no || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">{customer.profile?.city || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700`}>
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors">View Bookings</button>
                        <button className="px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 rounded hover:bg-rose-100 transition-colors">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
