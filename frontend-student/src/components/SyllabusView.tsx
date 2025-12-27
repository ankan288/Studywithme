import React, { useState } from 'react';
import { ChevronRight, Clock, CheckCircle, Lock, BookOpen, Target, AlertCircle } from 'lucide-react';
import type { ParsedSyllabus, Topic } from '../utils/syllabusApi';

interface SyllabusViewProps {
  syllabus: ParsedSyllabus;
  syllabusId: string;
  onStartLearning: (syllabusId: string) => void;
  onTopicSelect: (topic: Topic) => void;
}

export default function SyllabusView({ syllabus, syllabusId, onStartLearning, onTopicSelect }: SyllabusViewProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">{syllabus.subjectName}</h1>
        <p className="opacity-90 mb-4">{syllabus.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{syllabus.totalTopics} Topics</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{syllabus.estimatedDuration}</span>
          </div>
        </div>

        <button
          onClick={() => onStartLearning(syllabusId)}
          className="mt-4 px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Learning Path
        </button>
      </div>

      {/* Learning Objectives */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Learning Objectives
        </h2>
        <ul className="space-y-2">
          {syllabus.learningObjectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exam Pattern */}
      {syllabus.examPattern && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Exam Pattern
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Marks</div>
              <div className="text-xl font-semibold">{syllabus.examPattern.totalMarks}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-xl font-semibold">{syllabus.examPattern.duration}</div>
            </div>
          </div>
          <div className="space-y-2">
            {syllabus.examPattern.sections.map((section, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{section.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{section.questionType}</span>
                  <span className="font-medium text-blue-600">{section.marks} marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-6 pb-3">
          Course Topics ({syllabus.topics.length})
        </h2>
        
        <div className="divide-y">
          {syllabus.topics.map((topic, index) => (
            <div key={topic.id || index} className="group">
              <button
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                  {topic.order || index + 1}
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{topic.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{topic.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.estimatedHours}h
                  </span>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedTopic === topic.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </button>

              {expandedTopic === topic.id && (
                <div className="px-4 pb-4 pl-16 bg-gray-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Subtopics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {topic.subtopics.map((subtopic, i) => (
                        <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm text-gray-600">
                          {subtopic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {topic.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</h4>
                      <p className="text-sm text-gray-500">{topic.prerequisites.join(', ')}</p>
                    </div>
                  )}

                  <button
                    onClick={() => onTopicSelect(topic)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Study This Topic
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
