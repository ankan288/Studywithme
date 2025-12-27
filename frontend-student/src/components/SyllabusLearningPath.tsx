import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Lock, Play, Clock, BookOpen, ArrowLeft } from 'lucide-react';
import type { LearningPath, LearningModule } from '../utils/syllabusApi';

interface SyllabusLearningPathProps {
  learningPath: LearningPath;
  onModuleSelect: (module: LearningModule) => void;
  onGenerateQuiz: (topicId: string) => void;
  onBack: () => void;
}

export default function SyllabusLearningPath({ learningPath, onModuleSelect, onGenerateQuiz, onBack }: SyllabusLearningPathProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    learningPath.currentModuleId
  );

  const getModuleStatusIcon = (status: LearningModule['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'available':
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getModuleStatusClass = (status: LearningModule['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'available':
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'locked':
        return 'border-gray-200 bg-gray-50 opacity-60';
    }
  };

  // Group modules by topic
  const groupedModules = learningPath.modules.reduce((acc, module) => {
    if (!acc[module.topicName]) {
      acc[module.topicName] = [];
    }
    acc[module.topicName].push(module);
    return acc;
  }, {} as Record<string, LearningModule[]>);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Syllabus
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">{learningPath.subjectName}</h1>
        <p className="opacity-90 mb-4">Your personalized learning journey</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(learningPath.progress.percentage)}%</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${learningPath.progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{learningPath.completedModules} / {learningPath.totalModules} modules</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{Math.round(learningPath.progress.timeSpent / 60)} hours spent</span>
          </div>
        </div>
      </div>

      {/* Modules by Topic */}
      <div className="space-y-6">
        {Object.entries(groupedModules).map(([topicName, modules], topicIndex) => (
          <div key={topicName} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium">
                  {topicIndex + 1}
                </div>
                <h2 className="font-semibold text-gray-900">{topicName}</h2>
              </div>
              <button
                onClick={() => onGenerateQuiz(modules[0].topicId)}
                className="text-sm px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Practice Quiz
              </button>
            </div>

            <div className="divide-y">
              {modules.map((module) => (
                <div 
                  key={module.id}
                  className={`border-l-4 ${
                    module.status === 'completed' ? 'border-l-green-500' :
                    module.status === 'available' ? 'border-l-blue-500' :
                    'border-l-gray-300'
                  }`}
                >
                  <button
                    onClick={() => {
                      if (module.status !== 'locked') {
                        setExpandedModule(expandedModule === module.id ? null : module.id);
                      }
                    }}
                    disabled={module.status === 'locked'}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed ${
                      getModuleStatusClass(module.status)
                    }`}
                  >
                    {getModuleStatusIcon(module.status)}
                    
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">
                        Module {module.moduleNumber}: {module.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {module.estimatedTime} min • {module.objectives.length} objectives
                      </p>
                    </div>

                    {module.status !== 'locked' && (
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedModule === module.id ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>

                  {expandedModule === module.id && module.status !== 'locked' && (
                    <div className="px-4 pb-4 pl-12 bg-white">
                      {/* Objectives */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                        <ul className="space-y-1">
                          {module.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Points Preview */}
                      {module.content.keyPoints.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h4>
                          <div className="flex flex-wrap gap-2">
                            {module.content.keyPoints.slice(0, 3).map((point, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                {point.length > 30 ? point.slice(0, 30) + '...' : point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => onModuleSelect(module)}
                        className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        {module.status === 'completed' ? 'Review Module' : 'Start Learning'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
