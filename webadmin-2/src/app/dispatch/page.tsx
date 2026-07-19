import React from 'react';

const MOCK_INCOMING = [
  { id: 'BK-1045', service: 'Plumbing - Pipe Leak', location: 'Lazimpat', time: '10:00 AM, Today', price: 'NPR 1,500' },
  { id: 'BK-1046', service: 'Electrical - Wiring', location: 'Patan', time: '2:00 PM, Tomorrow', price: 'NPR 2,200' },
];

const MOCK_ASSIGNED = [
  { id: 'BK-1041', service: 'Masonry - Wall Repair', location: 'Baneshwor', assignee: 'Rajesh Maharjan', status: 'In Progress' },
];

export default function ManualDispatchPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manual Dispatch Board</h1>
        <p className="text-slate-500 mt-2">Route incoming customer bookings to specific employees in your fleet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Incoming Bookings Column */}
        <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Incoming Requests</h2>
            <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full text-sm">2 Pending</span>
          </div>

          <div className="space-y-4">
            {MOCK_INCOMING.map((booking) => (
              <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{booking.id}</span>
                    <h3 className="font-bold text-slate-900 text-lg">{booking.service}</h3>
                  </div>
                  <span className="font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{booking.price}</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {booking.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {booking.time}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Assign To Employee</label>
                  <div className="flex gap-2">
                    <select className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Select available worker...</option>
                      <option value="EMP-001">Rajesh Maharjan (Plumber) - Available</option>
                      <option value="EMP-003">Bikram Thapa (Mason) - Offline</option>
                    </select>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Dispatch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Bookings Column */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Assigned & Active</h2>
            <span className="bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-full text-sm">1 Active</span>
          </div>

          <div className="space-y-4">
            {MOCK_ASSIGNED.map((booking) => (
              <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{booking.id}</span>
                    <h3 className="font-bold text-slate-900">{booking.service}</h3>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">{booking.status}</span>
                </div>
                
                <div className="flex items-center text-sm text-slate-600 gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {booking.location}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Assigned To</p>
                      <p className="text-sm font-bold text-slate-800">{booking.assignee}</p>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors">Reassign</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
