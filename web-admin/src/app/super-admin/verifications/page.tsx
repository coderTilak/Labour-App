import React from 'react';

const MOCK_REQUESTS = [
  {
    id: 'req-1',
    userName: 'Suresh Thapa',
    userRole: 'worker',
    documentType: 'citizenship',
    status: 'pending',
    submittedAt: '2026-07-18 14:30',
  },
  {
    id: 'req-2',
    userName: 'BuildWell Construction Pvt. Ltd.',
    userRole: 'company',
    documentType: 'pan_vat',
    status: 'pending',
    submittedAt: '2026-07-19 09:15',
  },
  {
    id: 'req-3',
    userName: 'Himalaya Plumbing Works',
    userRole: 'company',
    documentType: 'company_registration',
    status: 'approved',
    submittedAt: '2026-07-15 11:00',
  },
];

export default function VerificationQueuePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Verification Queue</h1>
          <p className="text-slate-500 mt-2">Review user identity (KYC) and corporate registry documents.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
              <th className="py-3 px-6 font-semibold">User / Entity</th>
              <th className="py-3 px-6 font-semibold">Role</th>
              <th className="py-3 px-6 font-semibold">Document Type</th>
              <th className="py-3 px-6 font-semibold">Date Submitted</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REQUESTS.map((req) => (
              <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-800">{req.userName}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${req.userRole === 'worker' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {req.userRole.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{req.documentType.replace('_', ' ').toUpperCase()}</td>
                <td className="py-4 px-6 text-sm text-slate-500">{req.submittedAt}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {req.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">Approve</button>
                      <button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">Reject</button>
                      <button className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium transition-colors">View Doc</button>
                    </div>
                  ) : (
                    <button className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium transition-colors">View Record</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
