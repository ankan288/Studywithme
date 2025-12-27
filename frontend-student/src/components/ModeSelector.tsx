import React from 'react';
import { TaskMode } from '@/types';
import { GraduationCap, PenTool } from 'lucide-react';

interface Props {
  currentMode: TaskMode;
  onChange: (mode: TaskMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<Props> = ({ currentMode, onChange, disabled }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg">
      <button
        onClick={() => onChange(TaskMode.Learning)}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          currentMode === TaskMode.Learning
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <GraduationCap size={16} />
        Learning
      </button>
      <button
        onClick={() => onChange(TaskMode.Assignment)}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          currentMode === TaskMode.Assignment
            ? 'bg-white text-amber-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <PenTool size={16} />
        Assignment
      </button>
    </div>
  );
};

export default ModeSelector;