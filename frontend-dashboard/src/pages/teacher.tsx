import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Building } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">Teacher Dashboard</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Class Management</p>
          </div>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Overview</Link>
          <Link href="/teacher" className="text-indigo-600 font-medium">Teacher</Link>
          <Link href="/institution" className="text-slate-600 hover:text-indigo-600">Institution</Link>
        </nav>
      </header>
      
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Class Progress Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Students" value="24" color="bg-blue-50 text-blue-600" />
            <StatCard title="Avg. Mastery" value="72%" color="bg-emerald-50 text-emerald-600" />
            <StatCard title="Active (7d)" value="18" color="bg-indigo-50 text-indigo-600" />
            <StatCard title="At-Risk Topics" value="3" color="bg-red-50 text-red-600" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Student Performance</h3>
            <p className="text-slate-500">Detailed student analytics will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200">
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    <p className={`text-3xl font-bold ${color.includes('text') ? color.split(' ')[1] : 'text-slate-800'}`}>{value}</p>
  </div>
);
