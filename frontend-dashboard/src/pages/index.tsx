import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, RefreshCcw } from 'lucide-react';
import { dashboardApi, DashboardMetrics } from '@/utils/dashboardApi';

// Components
import { ProgressSummary } from '@/components/ProgressSummary';
import { DepthAnalytics } from '@/components/DepthAnalytics';
import { EthicsMonitor } from '@/components/EthicsMonitor';
import { SystemHealth } from '@/components/SystemHealth';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teacher' | 'institution'>('teacher');

  const fetchMetrics = async () => {
    setLoading(true);
    const result = await dashboardApi.getMetrics();
    if (result.success && result.data) {
      setMetrics(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <div>
             <h1 className="font-bold text-lg leading-tight text-slate-800">StudyWithMe Dashboard</h1>
             <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
               {activeTab === 'teacher' ? 'Teacher View' : 'Institution Audit'}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
             <button 
               onClick={() => setActiveTab('teacher')}
               className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'teacher' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Teacher
             </button>
             <button 
               onClick={() => setActiveTab('institution')}
               className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'institution' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Institution
             </button>
          </div>

          <button onClick={fetchMetrics} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="h-6 w-px bg-slate-200"></div>

          <Link href="http://localhost:3001" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
            <LogOut size={16} />
            Back to App
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading || !metrics ? (
           <div className="flex items-center justify-center h-full">
             <div className="animate-pulse flex flex-col items-center">
               <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
               <div className="h-4 w-32 bg-slate-200 rounded"></div>
             </div>
           </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {activeTab === 'teacher' && (
              <>
                <section>
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Class Progress Overview</h2>
                  <ProgressSummary metrics={metrics.teacher} />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <DepthAnalytics 
                     distribution={metrics.institution.depthDistribution} 
                     total={metrics.institution.totalInteractions} 
                   />
                   <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col justify-center">
                     <h3 className="text-lg font-bold text-indigo-900 mb-2">Instructor Insight</h3>
                     <p className="text-indigo-700 mb-4">
                       Based on recent activity, <strong>Core</strong> concepts are well understood. Consider assigning more <strong>Applied</strong> tasks to bridge the gap to Mastery.
                     </p>
                     <button className="self-start bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                       Generate Applied Assignment
                     </button>
                   </div>
                </div>
              </>
            )}

            {activeTab === 'institution' && (
              <>
                <section>
                   <h2 className="text-xl font-bold text-slate-800 mb-4">System Audit</h2>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <SystemHealth 
                        avgAlignment={metrics.institution.avgDepthAlignment}
                        avgClarity={metrics.institution.avgClarity}
                      />
                      <EthicsMonitor 
                        flagCount={metrics.institution.ethicsFlagCount}
                        totalInteractions={metrics.institution.totalInteractions}
                      />
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Depth Compliance</h3>
                        <p className="text-sm text-slate-500 mb-4">Ensure system is not defaulting to surface-level answers.</p>
                        <DepthAnalytics 
                          distribution={metrics.institution.depthDistribution} 
                          total={metrics.institution.totalInteractions} 
                        />
                      </div>
                   </div>
                </section>
                
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Transparency Log</h3>
                  <p className="text-sm text-slate-500 mb-6">Recent system interventions and policy triggers.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Time</th>
                          <th className="px-4 py-3">Mode</th>
                          <th className="px-4 py-3">Depth</th>
                          <th className="px-4 py-3">Ethics Flag</th>
                          <th className="px-4 py-3 rounded-r-lg">Quality Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {[...Array(5)].map((_, i) => (
                           <tr key={i} className="hover:bg-slate-50">
                             <td className="px-4 py-3 text-slate-500">Just now</td>
                             <td className="px-4 py-3 font-medium">Learning</td>
                             <td className="px-4 py-3">
                               <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Core</span>
                             </td>
                             <td className="px-4 py-3 text-emerald-600">Pass</td>
                             <td className="px-4 py-3 font-bold text-slate-800">0.98</td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
};