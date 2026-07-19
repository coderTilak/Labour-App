import React from 'react';

const MOCK_FLEET = [
  { id: 'EMP-001', name: 'Rajesh Maharjan', role: 'Senior Plumber', branch: 'HQ - New Baneshwor', status: 'Available' },
  { id: 'EMP-002', name: 'Sita Tamang', role: 'Electrician', branch: 'Branch - Lalitpur', status: 'On Job' },
  { id: 'EMP-003', name: 'Bikram Thapa', role: 'Mason', branch: 'HQ - New Baneshwor', status: 'Offline' },
];

export default function FleetManagementPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fleet Management</h1>
          <p className="text-slate-500 mt-2">Manage your internal employee accounts and branch assignments.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <input 
            type="text" 
            placeholder="Search employees by name or ID..." 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option>All Branches</option>
            <option>HQ - New Baneshwor</option>
            <option>Branch - Lalitpur</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option>All Statuses</option>
            <option>Available</option>
            <option>On Job</option>
            <option>Offline</option>
          </select>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-600 text-sm">
              <th className="py-4 px-6 font-semibold">Employee ID</th>
              <th className="py-4 px-6 font-semibold">Name</th>
              <th className="py-4 px-6 font-semibold">Trade / Role</th>
              <th className="py-4 px-6 font-semibold">Branch</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FLEET.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-500">{emp.id}</td>
                <td className="py-4 px-6 font-bold text-slate-800">{emp.name}</td>
                <td className="py-4 px-6 text-slate-600">{emp.role}</td>
                <td className="py-4 px-6 text-slate-600">{emp.branch}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    emp.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                    emp.status === 'On Job' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {emp.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded hover:bg-teal-100 transition-colors">Edit</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 rounded hover:bg-rose-100 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500 text-center">
          Showing 3 of 3 employees. Fleet limit: 10 (Growth Tier).
        </div>
      </div>
    </div>
  );
}
