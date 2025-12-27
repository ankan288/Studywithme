import React from 'react';

enum DepthLevel {
  Core = 'Core',
  Applied = 'Applied',
  Mastery = 'Mastery'
}

interface Props {
  distribution: Record<string, number>;
  total: number;
}

export const DepthAnalytics: React.FC<Props> = ({ distribution, total }) => {
  const getPercent = (count: number) => total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Learning Depth Distribution</h3>
      
      <div className="space-y-6">
        <Bar 
          label="Core (Fundamentals)" 
          percent={getPercent(distribution[DepthLevel.Core])} 
          count={distribution[DepthLevel.Core]}
          color="bg-blue-500" 
        />
        <Bar 
          label="Applied (Practice)" 
          percent={getPercent(distribution[DepthLevel.Applied])} 
          count={distribution[DepthLevel.Applied]}
          color="bg-emerald-500" 
        />
        <Bar 
          label="Mastery (Deep Dive)" 
          percent={getPercent(distribution[DepthLevel.Mastery])} 
          count={distribution[DepthLevel.Mastery]}
          color="bg-purple-500" 
        />
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          * Shows the proportion of interactions at each depth level across all sessions.
        </p>
      </div>
    </div>
  );
};

const Bar = ({ label, percent, count, color }: any) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-900">{count} ({percent.toFixed(1)}%)</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ${color}`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);