import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, BookOpen, Lightbulb, AlertTriangle, ChevronRight, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { LearningModule } from '../utils/syllabusApi';

interface ModuleStudyViewProps {
  module: LearningModule;
  pathId: string;
  userId: string;
  onComplete: (score: number, timeSpent: number, incorrectAreas: string[]) => void;
  onBack: () => void;
}

export default function ModuleStudyView({ module, pathId, userId, onComplete, onBack }: ModuleStudyViewProps) {
  const [currentSection, setCurrentSection] = useState<'content' | 'exercises'>('content');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<{ correct: boolean; topic: string }[]>([]);
  const [startTime] = useState(Date.now());

  const handleExerciseResult = (correct: boolean) => {
    setExerciseResults(prev => [...prev, { 
      correct, 
      topic: module.topicName 
    }]);
    setShowAnswer(true);
  };

  const nextExercise = () => {
    if (exerciseIndex < module.exercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Calculate results and complete
      const correctCount = exerciseResults.filter(r => r.correct).length + (showAnswer ? 0 : 0);
      const score = Math.round((correctCount / module.exercises.length) * 100);
      const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes
      const incorrectAreas = exerciseResults.filter(r => !r.correct).map(r => r.topic);
      
      onComplete(score, timeSpent, [...new Set(incorrectAreas)]);
    }
  };

  const currentExercise = module.exercises[exerciseIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Path
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
            <BookOpen className="w-4 h-4" />
            Module {module.moduleNumber} • {module.topicName}
          </div>
          <h1 className="text-2xl font-bold mb-2">{module.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {module.estimatedTime} min
            </span>
            <span>{module.objectives.length} objectives</span>
            <span>{module.exercises.length} exercises</span>
          </div>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
        <button
          onClick={() => setCurrentSection('content')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
            currentSection === 'content'
              ? 'bg-white shadow text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Learn
        </button>
        <button
          onClick={() => setCurrentSection('exercises')}
          className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
            currentSection === 'exercises'
              ? 'bg-white shadow text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Play className="w-4 h-4" />
          Practice ({exerciseResults.length}/{module.exercises.length})
        </button>
      </div>

      {currentSection === 'content' ? (
        <div className="space-y-6">
          {/* Objectives */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {module.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
            <div className="prose max-w-none text-gray-700">
              <ReactMarkdown>{module.content.explanation}</ReactMarkdown>
            </div>
          </div>

          {/* Key Points */}
          {module.content.keyPoints.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Key Points to Remember
              </h2>
              <ul className="space-y-2">
                {module.content.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-amber-800">
                    <span className="text-amber-500 font-bold">→</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {module.content.examples.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Examples</h2>
              <div className="space-y-4">
                {module.content.examples.map((example, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-700 mb-2">Example {i + 1}</div>
                    <div className="text-gray-600 whitespace-pre-wrap">{example}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulae */}
          {module.content.formulae && module.content.formulae.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Important Formulae</h2>
              <div className="space-y-2">
                {module.content.formulae.map((formula, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg font-mono text-blue-800">
                    {formula}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA to Practice */}
          <div className="text-center py-6">
            <button
              onClick={() => setCurrentSection('exercises')}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              Start Practice Exercises
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Exercise Progress */}
          <div className="flex items-center gap-4 mb-4">
            {module.exercises.map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  i < exerciseResults.length
                    ? exerciseResults[i]?.correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : i === exerciseIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Current Exercise */}
          {currentExercise && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentExercise.type === 'concept_check' ? 'bg-green-100 text-green-700' :
                  currentExercise.type === 'practice' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {currentExercise.type.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-6">
                {currentExercise.question}
              </h3>

              {!showAnswer ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleExerciseResult(true)}
                    className="flex-1 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-green-700"
                  >
                    I know this ✓
                  </button>
                  <button
                    onClick={() => handleExerciseResult(false)}
                    className="flex-1 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-orange-700"
                  >
                    Show me the answer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Answer:</h4>
                    <p className="text-blue-800 whitespace-pre-wrap">{currentExercise.answer}</p>
                  </div>
                  
                  <button
                    onClick={nextExercise}
                    className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {exerciseIndex < module.exercises.length - 1 ? (
                      <>
                        Next Exercise
                        <ChevronRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Complete Module
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
