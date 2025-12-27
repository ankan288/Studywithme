import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight, Award, RotateCcw, Loader2 } from 'lucide-react';
import type { Question, QuestionSet, AssessmentResult } from '../utils/syllabusApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface QuizViewProps {
  questionSet: QuestionSet;
  userId: string;
  onComplete: (result: AssessmentResult) => void;
  onRetry: () => void;
}

export default function QuizView({ questionSet, userId, onComplete, onRetry }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeStarted] = useState(Date.now());

  const currentQuestion = questionSet.questions[currentIndex];
  const progress = ((currentIndex + 1) / questionSet.questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const goToNext = () => {
    if (currentIndex < questionSet.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/syllabus/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionSetId: questionSet.id,
          userId,
          answers
        })
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      const resultData = await response.json();
      setResult(resultData);
      setShowResults(true);
      onComplete(resultData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (showResults && result) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        {/* Results Summary */}
        <div className={`rounded-2xl p-6 text-white mb-6 ${
          result.percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-2">{result.percentage}%</h1>
            <p className="text-xl opacity-90">Grade: {result.grade}</p>
            <p className="mt-2 opacity-80">{result.score} / {result.maxScore} marks</p>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Feedback</h2>
          <p className="text-gray-700">{result.feedback}</p>
          
          {result.weakAreas.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve:</h3>
              <div className="flex flex-wrap gap-2">
                {result.weakAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <h2 className="text-lg font-semibold p-6 pb-3">Detailed Review</h2>
          <div className="divide-y">
            {result.results.map((r, index) => (
              <div key={index} className={`p-4 ${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  {r.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      Q{index + 1}: {r.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className={r.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        Your answer: {r.yourAnswer}
                      </p>
                      {!r.isCorrect && (
                        <p className="text-green-700">Correct answer: {r.correctAnswer}</p>
                      )}
                      <p className="text-gray-600 mt-2">{r.explanation}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {r.marks}/{r.maxMarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questionSet.questions.length}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {questionSet.duration} min
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {currentQuestion.difficulty}
          </span>
          <span className="text-sm text-gray-500">{currentQuestion.marks} marks</span>
          <span className="text-sm text-gray-500">• {currentQuestion.topicName}</span>
        </div>

        <h2 className="text-xl font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Answer Input based on question type */}
        {currentQuestion.type === 'mcq' && currentQuestion.options ? (
          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : currentQuestion.type === 'true_false' ? (
          <div className="flex gap-4">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={currentQuestion.type === 'long_answer' ? 8 : 4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        )}
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questionSet.questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              i === currentIndex
                ? 'bg-blue-500 text-white'
                : answers[q.id]
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Previous
        </button>

        {currentIndex === questionSet.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goToNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
