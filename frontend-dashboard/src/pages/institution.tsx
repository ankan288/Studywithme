import React from 'react';
import Link from 'next/link';
import { Building, Shield, Activity } from 'lucide-react';

export default function InstitutionDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Building size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">Institution Dashboard</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">System Audit</p>
          </div>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Overview</Link>
          <Link href="/teacher" className="text-slate-600 hover:text-indigo-600">Teacher</Link>
          <Link href="/institution" className="text-indigo-600 font-medium">Institution</Link>
        </nav>
      </header>
      
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">System Audit</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 text-white p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-yellow-400" size={20} />
                <h3 className="font-bold">System Health</h3>
              </div>
              <div className="space-y-4">
                <HealthBar label="Depth Alignment" value={92} />
                <HealthBar label="Response Clarity" value={88} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-indigo-600" size={20} />
                <h3 className="font-bold text-slate-800">Ethics Monitor</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-indigo-600">98.5%</p>
                <p className="text-sm text-slate-500">Compliance Rate</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Total Interactions</h3>
              <p className="text-4xl font-bold text-slate-800">1,247</p>
              <p className="text-sm text-slate-500">Last 30 days</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transparency Log</h3>
            <p className="text-slate-500">System interventions and policy triggers will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const HealthBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-bold text-emerald-400">{value}%</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);
