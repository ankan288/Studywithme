import React from 'react';
import { StudentProfile, LearningInsight } from '@/types';
import { TrendingUp, BookOpen, Target } from 'lucide-react';

interface Props {
  profile: StudentProfile | null;
  insights: LearningInsight[];
}

export const ProgressOverview: React.FC<Props> = ({ profile, insights }) => {
  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-400">
        No progress data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          Overall Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{profile.overallStats.totalSessions}</p>
            <p className="text-xs text-slate-500">Total Sessions</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{profile.overallStats.highestDepthReached}</p>
            <p className="text-xs text-slate-500">Highest Depth</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{profile.overallStats.averageReasoningScore.toFixed(0)}%</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-amber-500" size={20} />
            Personalized Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg ${
                  insight.type === 'STRENGTH' ? 'bg-emerald-50 border border-emerald-100' :
                  insight.type === 'WEAKNESS' ? 'bg-red-50 border border-red-100' :
                  'bg-blue-50 border border-blue-100'
                }`}
              >
                <p className="font-medium text-sm">{insight.topic}</p>
                <p className="text-xs text-slate-600 mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;
