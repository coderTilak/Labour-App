import React from 'react';

export default function CompanyProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Corporate Profile</h1>
        <p className="text-slate-500 mt-2">Manage your core business details and spatial branch locations.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">General Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <input type="text" defaultValue="BuildWell Construction Pvt. Ltd." className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Registration Type</label>
            <input type="text" defaultValue="Private Limited (Company)" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 focus:outline-none" readOnly />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">PAN/VAT Document</label>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 flex-1">
                buildwell_pan_document_2026.pdf
              </div>
              <button className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-medium text-slate-700 transition-colors">Replace</button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm">Save Changes</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-xl font-semibold text-slate-800">Branch Locations</h2>
          <button className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-teal-200">
            + Add Branch
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">You have provisioned 2 out of 5 available branch offices on your Growth Tier.</p>
        
        <div className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50 hover:bg-white transition-colors">
            <div>
              <h3 className="font-bold text-slate-800">HQ - New Baneshwor</h3>
              <p className="text-sm text-slate-500 mt-1">Primary operations center. Serves Central KTM.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-100">Edit</button>
            </div>
          </div>
          
          <div className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50 hover:bg-white transition-colors">
            <div>
              <h3 className="font-bold text-slate-800">Branch - Lalitpur</h3>
              <p className="text-sm text-slate-500 mt-1">Secondary dispatch. Serves Patan & Ring Road.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-100">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
