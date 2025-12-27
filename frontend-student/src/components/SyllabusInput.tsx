import React, { useState } from 'react';
import { BookOpen, FileText, GraduationCap, Loader2, Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface SyllabusInputProps {
  onSyllabusCreated: (syllabusId: string, syllabus: any) => void;
}

export default function SyllabusInput({ onSyllabusCreated }: SyllabusInputProps) {
  const [inputType, setInputType] = useState<'subject_name' | 'syllabus_text'>('subject_name');
  const [content, setContent] = useState('');
  const [targetLevel, setTargetLevel] = useState<string>('undergraduate');
  const [examType, setExamType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter a subject name or syllabus content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/syllabus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inputType,
          content: content.trim(),
          targetLevel,
          examType: examType || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create syllabus');
      }

      const data = await response.json();
      onSyllabusCreated(data.syllabusId, data.syllabus);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const exampleSubjects = [
    'Data Structures and Algorithms',
    'Machine Learning',
    'Organic Chemistry',
    'Calculus',
    'World History',
    'Financial Accounting'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Learning Journey</h1>
        <p className="text-gray-600">Enter a subject name or paste your syllabus to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Type Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setInputType('subject_name')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              inputType === 'subject_name'
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Subject Name
          </button>
          <button
            type="button"
            onClick={() => setInputType('syllabus_text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              inputType === 'syllabus_text'
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Syllabus
          </button>
        </div>

        {/* Content Input */}
        {inputType === 'subject_name' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., Data Structures and Algorithms"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {exampleSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setContent(subject)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your syllabus content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your syllabus, course outline, or list of topics here..."
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Education Level
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="school">School (K-12)</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type (Optional)
            </label>
            <input
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g., CBSE, JEE, University"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating your personalized syllabus...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Learning Path
            </>
          )}
        </button>
      </form>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-4">
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-medium text-gray-900">Structured Topics</h3>
          <p className="text-sm text-gray-500">AI-organized curriculum</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">❓</div>
          <h3 className="font-medium text-gray-900">Exam Questions</h3>
          <p className="text-sm text-gray-500">Practice tests & Q&A</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-medium text-gray-900">Adaptive Learning</h3>
          <p className="text-sm text-gray-500">Personalized to you</p>
        </div>
      </div>
    </div>
  );
}
