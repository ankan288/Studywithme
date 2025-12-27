import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SyllabusInput from '../components/SyllabusInput';
import SyllabusView from '../components/SyllabusView';
import SyllabusLearningPath from '../components/SyllabusLearningPath';
import ModuleStudyView from '../components/ModuleStudyView';
import QuizView from '../components/QuizView';
import type { ParsedSyllabus, LearningPath, LearningModule, QuestionSet, Topic } from '../utils/syllabusApi';

type ViewState = 'input' | 'syllabus' | 'learning-path' | 'module' | 'quiz';

export default function LearnPage() {
  const [view, setView] = useState<ViewState>('input');
  const [syllabusId, setSyllabusId] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<ParsedSyllabus | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [userId] = useState(() => `user-${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSyllabusCreated = (id: string, data: ParsedSyllabus) => {
    setSyllabusId(id);
    setSyllabus(data);
    setView('syllabus');
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleStartLearning = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/syllabus/learning-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusId: id,
          userId,
          preferences: {
            pace: 'normal',
            depth: 'detailed'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create learning path');

      const data = await response.json();
      setLearningPath(data.learningPath);
      setView('learning-path');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    // Generate quiz for the topic
    handleGenerateQuiz(topic.id);
  };

  const handleModuleSelect = (module: LearningModule) => {
    setCurrentModule(module);
    setView('module');
  };

  const handleModuleComplete = async (score: number, timeSpent: number, incorrectAreas: string[]) => {
    if (!learningPath || !currentModule) return;

    try {
      const response = await fetch(`${API_URL}/api/syllabus/learning-path/${learningPath.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: currentModule.id,
          score,
          timeSpent,
          incorrectAreas
        })
      });

      if (!response.ok) throw new Error('Failed to complete module');

      const data = await response.json();
      setLearningPath(data.learningPath);
      setView('learning-path');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateQuiz = async (topicId: string) => {
    if (!syllabusId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/syllabus/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusId,
          topicId,
          count: 10,
          types: ['mcq', 'short_answer', 'true_false']
        })
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const data = await response.json();
      setQuestionSet({
        id: `quiz-${Date.now()}`,
        syllabusId: syllabusId,
        subjectName: syllabus?.subjectName || '',
        type: 'topic_practice',
        totalQuestions: data.questions.length,
        totalMarks: data.questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        duration: 15,
        questions: data.questions
      });
      setView('quiz');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('Quiz completed:', result);
  };

  const handleQuizRetry = () => {
    setView('learning-path');
    setQuestionSet(null);
  };

  return (
    <>
      <Head>
        <title>Learn - StudyWithMe</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3 hover:opacity-80">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
                <span className="font-bold text-xl text-gray-900">StudyWithMe</span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              {syllabus && (
                <nav className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setView('syllabus')}
                    className={`px-3 py-1 rounded-lg ${view === 'syllabus' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Syllabus
                  </button>
                  {learningPath && (
                    <button
                      onClick={() => setView('learning-path')}
                      className={`px-3 py-1 rounded-lg ${view === 'learning-path' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Learning Path
                    </button>
                  )}
                </nav>
              )}

              <div className="h-6 w-px bg-gray-200"></div>

              <nav className="flex items-center gap-2 text-sm">
                <a href="/" className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
                  Home
                </a>
                <a href="/dashboard" className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
                  Dashboard
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-red-700 text-center">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700">Generating your personalized content...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="py-8">
          {view === 'input' && (
            <SyllabusInput onSyllabusCreated={handleSyllabusCreated} />
          )}

          {view === 'syllabus' && syllabus && syllabusId && (
            <SyllabusView
              syllabus={syllabus}
              syllabusId={syllabusId}
              onStartLearning={handleStartLearning}
              onTopicSelect={handleTopicSelect}
            />
          )}

          {view === 'learning-path' && learningPath && (
            <SyllabusLearningPath
              learningPath={learningPath}
              onModuleSelect={handleModuleSelect}
              onGenerateQuiz={handleGenerateQuiz}
              onBack={() => setView('syllabus')}
            />
          )}

          {view === 'module' && currentModule && learningPath && (
            <ModuleStudyView
              module={currentModule}
              pathId={learningPath.id}
              userId={userId}
              onComplete={handleModuleComplete}
              onBack={() => setView('learning-path')}
            />
          )}

          {view === 'quiz' && questionSet && (
            <QuizView
              questionSet={questionSet}
              userId={userId}
              onComplete={handleQuizComplete}
              onRetry={handleQuizRetry}
            />
          )}
        </main>
      </div>
    </>
  );
}
