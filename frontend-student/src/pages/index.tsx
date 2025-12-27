import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, ShieldCheck, LayoutDashboard, AlertCircle, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { DepthLevel, TaskMode, Message } from '@/types';
import { useChat } from '@/hooks/useChat';

// Components
import { MessageBubble } from '@/components/MessageBubble';
import { DepthSelector } from '@/components/DepthSelector';
import { ModeSelector } from '@/components/ModeSelector';
import { AssignmentFeedbackPanel } from '@/components/AssignmentFeedback';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const StudentHomePage: React.FC = () => {
  const { sendMessage: chatSendMessage, loading: chatLoading } = useChat();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Syllabus state
  const [syllabusMode, setSyllabusMode] = useState(false);
  const [currentSyllabus, setCurrentSyllabus] = useState<any>(null);
  const [currentSyllabusId, setCurrentSyllabusId] = useState<string | null>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  // Settings
  const [depth, setDepth] = useState<DepthLevel>(DepthLevel.Core);
  const [mode, setMode] = useState<TaskMode>(TaskMode.Learning);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize on client only to avoid hydration errors
  useEffect(() => {
    setMounted(true);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your StudyWithMe tutor. 📚\n\nI can help you in two ways:\n\n**1. Chat Mode** - Ask me anything and I'll explain at your chosen depth level\n\n**2. Syllabus Mode** - Type a subject name (like 'Data Structures' or 'Physics') and I'll create a complete learning path with topics, explanations, and practice questions!\n\nWhat would you like to learn today?",
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if input looks like a subject/syllabus request
  const detectSyllabusIntent = (text: string): boolean => {
    const syllabusKeywords = ['learn', 'teach me', 'syllabus', 'course', 'subject', 'study', 'curriculum', 'topics in', 'about'];
    const lowerText = text.toLowerCase();

    // Check if it's a short subject name (1-4 words without question marks)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount <= 4 && !text.includes('?') && !text.includes('what') && !text.includes('how') && !text.includes('why')) {
      return true;
    }

    return syllabusKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleCreateSyllabus = async (subjectName: string) => {
    setSyllabusLoading(true);

    const statusMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🔄 Creating your personalized learning path for **${subjectName}**...\n\nThis includes:\n- 📋 Structured topics\n- 📖 Detailed explanations\n- ❓ Practice questions\n- 📊 Progress tracking`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, statusMsg]);

    try {
      const response = await fetch(`${API_URL}/api/syllabus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subject_name',
          content: subjectName,
          targetLevel: 'undergraduate'
        })
      });

      if (!response.ok) throw new Error('Failed to create syllabus');

      const data = await response.json();
      setCurrentSyllabus(data.syllabus);
      setCurrentSyllabusId(data.syllabusId);
      setSyllabusMode(true);

      // Show syllabus summary in chat
      const topicsList = data.syllabus.topics.slice(0, 5).map((t: any, i: number) =>
        `${i + 1}. **${t.name}** - ${t.description.slice(0, 60)}...`
      ).join('\n');

      const syllabusMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ **Learning Path Created: ${data.syllabus.subjectName}**\n\n${data.syllabus.description}\n\n**📚 Topics (${data.syllabus.totalTopics} total):**\n${topicsList}\n${data.syllabus.topics.length > 5 ? `\n...and ${data.syllabus.topics.length - 5} more topics` : ''}\n\n**⏱️ Estimated Duration:** ${data.syllabus.estimatedDuration}\n\n---\n\n**What would you like to do?**\n- Ask about any topic (e.g., "Explain arrays")\n- Say "quiz me" for practice questions\n- Say "start learning" to begin from Topic 1\n- Say "generate exam" for a mock test`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, syllabusMsg]);

    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "❌ Sorry, I couldn't create the syllabus. Please check if the backend is running and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSyllabusLoading(false);
    }
  };

  const handleSyllabusCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('quiz') || lowerCommand.includes('practice') || lowerCommand.includes('test me')) {
      // Generate quiz
      if (!currentSyllabus || !currentSyllabusId) return;

      setSyllabusLoading(true);
      try {
        const topic = currentSyllabus.topics[0];
        const response = await fetch(`${API_URL}/api/syllabus/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syllabusId: currentSyllabusId,
            topicId: topic.id,
            count: 5,
            types: ['mcq', 'short_answer']
          })
        });

        if (!response.ok) throw new Error('Failed to generate quiz');

        const data = await response.json();
        const questionsText = data.questions.slice(0, 3).map((q: any, i: number) =>
          `**Q${i + 1}:** ${q.question}\n${q.options ? q.options.join('\n') : ''}`
        ).join('\n\n');

        const quizMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📝 **Quick Quiz: ${topic.name}**\n\n${questionsText}\n\n---\nType your answers or say "show answers" to see solutions!`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, quizMsg]);
      } catch (err) {
        console.error(err);
      } finally {
        setSyllabusLoading(false);
      }
      return true;
    }

    if (lowerCommand.includes('start learning') || lowerCommand.includes('begin')) {
      // Start from first topic
      if (!currentSyllabus) return;

      const firstTopic = currentSyllabus.topics[0];
      const topicMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📖 **Topic 1: ${firstTopic.name}**\n\n${firstTopic.description}\n\n**Subtopics:**\n${firstTopic.subtopics.map((s: string) => `• ${s}`).join('\n')}\n\n**Difficulty:** ${firstTopic.difficulty}\n**Estimated Time:** ${firstTopic.estimatedHours} hours\n\n---\n\nAsk me anything about this topic, or say "next topic" to continue!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, topicMsg]);
      return true;
    }

    if (lowerCommand.includes('generate exam') || lowerCommand.includes('mock exam')) {
      // Generate exam
      setSyllabusLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/syllabus/exam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syllabusId: currentSyllabusId,
            duration: 60,
            totalMarks: 50,
            pattern: 'university'
          })
        });

        if (!response.ok) throw new Error('Failed to generate exam');

        const data = await response.json();
        const examMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📋 **Mock Exam Generated!**\n\n**Subject:** ${data.exam.subjectName}\n**Total Questions:** ${data.exam.totalQuestions}\n**Total Marks:** ${data.exam.totalMarks}\n**Duration:** ${data.exam.duration} minutes\n\n---\n\nGo to the **Learn** page to take this exam with a timer and auto-grading!\n\n[Click here to start](/learn)`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, examMsg]);
      } catch (err) {
        console.error(err);
      } finally {
        setSyllabusLoading(false);
      }
      return true;
    }

    return false;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || syllabusLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      metadata: { depth, mode }
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Check if this is a syllabus command (when syllabus is active)
      if (syllabusMode && currentSyllabus) {
        const handled = await handleSyllabusCommand(currentInput);
        if (handled) {
          setLoading(false);
          return;
        }
      }

      // Check if user wants to create a new syllabus/learn a subject
      if (detectSyllabusIntent(currentInput) && !syllabusMode) {
        // Extract subject name
        let subjectName = currentInput
          .replace(/^(learn|teach me|i want to learn|study|syllabus for|course on|about)\s*/i, '')
          .trim();

        if (subjectName.length > 2) {
          await handleCreateSyllabus(subjectName);
          setLoading(false);
          return;
        }
      }

      // Regular chat message
      const response = await chatSendMessage(currentInput, depth, mode);

      if (response.error) {
        throw new Error(response.error);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        metadata: {
          depth,
          mode,
          isAssignment: mode === TaskMode.Assignment
        }
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: "System Error: Unable to process request. Please check your network connection.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Don't render until mounted to avoid hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // --- RENDER STUDENT VIEW ---
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">

      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
            StudyWithMe
          </h1>
          <p className="text-xs text-slate-400 mt-1">Ethical Depth-Driven Learning</p>
        </div>

        <div className="p-6 flex-1 space-y-6 overflow-y-auto">

          {/* Current Syllabus Info */}
          {syllabusMode && currentSyllabus && (
            <section className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h3 className="text-emerald-800 font-bold text-sm">Active Course</h3>
              </div>
              <p className="text-sm font-medium text-slate-800">{currentSyllabus.subjectName}</p>
              <p className="text-xs text-slate-500 mt-1">{currentSyllabus.totalTopics} topics • {currentSyllabus.estimatedDuration}</p>
              <button
                onClick={() => {
                  setSyllabusMode(false);
                  setCurrentSyllabus(null);
                  setCurrentSyllabusId(null);
                }}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Clear Course
              </button>
            </section>
          )}

          {/* Quick Start for New Subject */}
          {!syllabusMode && (
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-purple-800 font-bold text-sm">Quick Start</h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">Type any subject to create a learning path!</p>
              <div className="flex flex-wrap gap-1">
                {['Python', 'Calculus', 'Physics', 'History'].map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      setInput(subject);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="px-2 py-1 bg-white border border-purple-200 rounded-full text-xs text-purple-700 hover:bg-purple-100"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Task Mode</h3>
            <ModeSelector
              currentMode={mode}
              onChange={setMode}
              disabled={loading}
            />
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Learning Depth</h3>
            <DepthSelector
              currentDepth={depth}
              onChange={setDepth}
              disabled={loading}
            />
          </section>

          <section className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-indigo-800 font-bold text-sm mb-1">Instructor Note</h3>
            <p className="text-xs text-indigo-600 leading-relaxed">
              {depth === DepthLevel.Core && "Focusing on simple explanations and basics."}
              {depth === DepthLevel.Applied && "Connecting concepts to real-world scenarios."}
              {depth === DepthLevel.Mastery && "Analyzing complex edge cases and theory."}
            </p>
          </section>

          {mode === TaskMode.Learning && (
            <button
              onClick={() => setShowAssignmentPanel(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> Generate Practice
            </button>
          )}

        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="/learn"
            className="w-full flex items-center justify-center gap-2 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
          >
            <BookOpen size={16} /> Full Learning View
          </a>
          <a
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={16} /> Open Dashboard
          </a>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-lg">StudyWithMe</span>
          <div className="flex gap-2">
            <a href="/dashboard"><LayoutDashboard size={24} className="text-slate-600" /></a>
            <button><Menu size={24} className="text-slate-600" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={mode === TaskMode.Assignment ? "Ask for a hint or guidance..." : "Ask a question..."}
              disabled={loading}
              className="w-full bg-slate-100 text-slate-800 placeholder:text-slate-400 pl-5 pr-12 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              autoFocus
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center">
            <p className="text-[10px] text-slate-400">
              {mode === TaskMode.Assignment
                ? "Assignment Mode: Direct answers are disabled to promote learning."
                : "StudyWithMe can make mistakes. Verify important information."}
            </p>
          </div>
        </div>
      </main>

      {/* Slide-over Assignment Panel */}
      {showAssignmentPanel && (
        <div className="absolute inset-y-0 right-0 z-20 shadow-2xl animate-in slide-in-from-right duration-300">
          <AssignmentFeedbackPanel depth={depth} onClose={() => setShowAssignmentPanel(false)} />
        </div>
      )}

    </div>
  );
};

export default StudentHomePage;