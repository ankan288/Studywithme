import React from 'react';
import { Users, TrendingUp, AlertOctagon, BookOpen } from 'lucide-react';

interface Props {
  metrics: {
    totalStudents: number;
    avgMastery: number;
    topicsAtRisk: { topic: string; avgScore: number }[];
    activeStudentsLast7Days: number;
  };
}

export const ProgressSummary: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={metrics.totalStudents} color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Avg. Mastery" value={`${metrics.avgMastery}%`} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={BookOpen} label="Active (7d)" value={metrics.activeStudentsLast7Days} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={AlertOctagon} label="At-Risk Topics" value={metrics.topicsAtRisk.length} color="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Topic Performance Watchlist</h3>
        {metrics.topicsAtRisk.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckMark />
            <p className="mt-2">All topics are performing well.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.topicsAtRisk.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="font-medium text-red-800">{t.topic}</span>
                <span className="font-bold text-red-600">{t.avgScore.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const CheckMark = () => (
  <svg className="w-12 h-12 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);