import React from 'react';
import { ShieldCheck, Award, Zap } from 'lucide-react';

interface Props {
  assignment: {
    topic: string;
    avgScore: number;
    completionRate: number;
    commonMistakes: string[];
  } | null;
}

export const AssignmentInsights: React.FC<Props> = ({ assignment }) => {
  if (!assignment) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="text-amber-500" size={20} />
          Assignment Insights
        </h3>
        <p className="text-slate-400 text-center py-8">No assignment data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Award className="text-amber-500" size={20} />
        Assignment Insights
      </h3>
      
      <div className="mb-4">
        <h4 className="font-medium text-slate-700">{assignment.topic}</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">Avg Score</p>
          <p className="text-xl font-bold text-slate-800">{assignment.avgScore}%</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">Completion</p>
          <p className="text-xl font-bold text-emerald-600">{assignment.completionRate}%</p>
        </div>
      </div>

      {assignment.commonMistakes.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-slate-600 mb-2">Common Mistakes</h5>
          <ul className="space-y-1">
            {assignment.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="text-sm text-slate-500 flex items-start gap-2">
                <Zap size={14} className="text-amber-500 mt-0.5" />
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignmentInsights;
