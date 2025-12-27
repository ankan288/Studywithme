import React from 'react';
import { DepthLevel } from '@/types';
import { Map, ChevronRight } from 'lucide-react';

interface LearningPath {
  studentId: string;
  recommendedDepth: DepthLevel;
  nextTopics: string[];
}

interface Props {
  path: LearningPath | null;
}

export const LearningPathView: React.FC<Props> = ({ path }) => {
  if (!path) {
    return (
      <div className="p-6 text-center text-slate-400">
        <Map className="mx-auto mb-2" size={32} />
        <p>Your learning path will appear here as you progress.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Map className="text-indigo-600" size={20} />
        Your Learning Path
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-slate-500">Recommended Depth Level</p>
        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
          path.recommendedDepth === DepthLevel.Core ? 'bg-blue-100 text-blue-700' :
          path.recommendedDepth === DepthLevel.Applied ? 'bg-emerald-100 text-emerald-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {path.recommendedDepth}
        </span>
      </div>

      {path.nextTopics.length > 0 && (
        <div>
          <p className="text-sm text-slate-500 mb-2">Suggested Next Topics</p>
          <div className="space-y-2">
            {path.nextTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <ChevronRight size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathView;
