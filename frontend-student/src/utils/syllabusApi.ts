// Syllabus API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Topic {
  id: string;
  name: string;
  description: string;
  subtopics: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  order: number;
}

export interface ParsedSyllabus {
  subjectName: string;
  description: string;
  totalTopics: number;
  estimatedDuration: string;
  topics: Topic[];
  learningObjectives: string[];
  examPattern?: {
    totalMarks: number;
    duration: string;
    sections: { name: string; marks: number; questionType: string }[];
  };
}

export interface LearningModule {
  id: string;
  topicId: string;
  topicName: string;
  moduleNumber: number;
  title: string;
  objectives: string[];
  content: {
    explanation: string;
    examples: string[];
    diagrams?: string[];
    formulae?: string[];
    keyPoints: string[];
  };
  estimatedTime: number;
  exercises: {
    type: 'concept_check' | 'practice' | 'application';
    question: string;
    answer: string;
  }[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export interface LearningPath {
  id: string;
  userId: string;
  syllabusId: string;
  subjectName: string;
  createdAt: string;
  totalModules: number;
  completedModules: number;
  currentModuleId: string | null;
  modules: LearningModule[];
  progress: {
    percentage: number;
    timeSpent: number;
    lastAccessed: string;
  };
}

export interface Question {
  id: string;
  topicId: string;
  topicName: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'numerical' | 'true_false' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  timeEstimate: number;
}

export interface QuestionSet {
  id: string;
  syllabusId: string;
  subjectName: string;
  type: 'topic_practice' | 'chapter_test' | 'mock_exam' | 'quick_revision';
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  questions: Question[];
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  results: {
    questionId: string;
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
    maxMarks: number;
    explanation: string;
  }[];
  weakAreas: string[];
  feedback: string;
}

// Create syllabus from subject name or text
export async function createSyllabus(params: {
  type: 'subject_name' | 'syllabus_text';
  content: string;
  targetLevel?: 'school' | 'undergraduate' | 'graduate' | 'professional';
  examType?: string;
}): Promise<{ syllabusId: string; syllabus: ParsedSyllabus }> {
  const response = await fetch(`${API_BASE}/syllabus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create syllabus');
  }
  
  return response.json();
}

// Get syllabus by ID
export async function getSyllabus(id: string): Promise<{ syllabus: ParsedSyllabus }> {
  const response = await fetch(`${API_BASE}/syllabus/${id}`);
  if (!response.ok) throw new Error('Failed to fetch syllabus');
  return response.json();
}

// Get all syllabi
export async function getAllSyllabi(): Promise<{ syllabi: ParsedSyllabus[]; count: number }> {
  const response = await fetch(`${API_BASE}/syllabus`);
  if (!response.ok) throw new Error('Failed to fetch syllabi');
  return response.json();
}

// Create learning path
export async function createLearningPath(params: {
  syllabusId: string;
  userId: string;
  preferences?: {
    pace?: 'slow' | 'normal' | 'fast';
    depth?: 'basic' | 'detailed' | 'comprehensive';
    focusTopics?: string[];
  };
}): Promise<{ learningPath: LearningPath }> {
  const response = await fetch(`${API_BASE}/syllabus/learning-path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create learning path');
  }
  
  return response.json();
}

// Get learning path
export async function getLearningPath(pathId: string): Promise<{ 
  learningPath: LearningPath; 
  nextRecommendedModule: LearningModule | null 
}> {
  const response = await fetch(`${API_BASE}/syllabus/learning-path/${pathId}`);
  if (!response.ok) throw new Error('Failed to fetch learning path');
  return response.json();
}

// Get user's learning paths
export async function getUserLearningPaths(userId: string): Promise<{ 
  learningPaths: LearningPath[]; 
  count: number 
}> {
  const response = await fetch(`${API_BASE}/syllabus/user/${userId}/paths`);
  if (!response.ok) throw new Error('Failed to fetch learning paths');
  return response.json();
}

// Complete a module
export async function completeModule(params: {
  pathId: string;
  moduleId: string;
  score: number;
  timeSpent: number;
  incorrectAreas?: string[];
}): Promise<{ learningPath: LearningPath; nextModule: LearningModule | null }> {
  const response = await fetch(`${API_BASE}/syllabus/learning-path/${params.pathId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to complete module');
  return response.json();
}

// Generate questions for topic
export async function generateQuestions(params: {
  syllabusId: string;
  topicId: string;
  count?: number;
  types?: Question['type'][];
  difficulty?: Question['difficulty'];
}): Promise<{ questions: Question[] }> {
  const response = await fetch(`${API_BASE}/syllabus/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to generate questions');
  return response.json();
}

// Generate mock exam
export async function generateExam(params: {
  syllabusId: string;
  duration?: number;
  totalMarks?: number;
  pattern?: 'board' | 'competitive' | 'university';
}): Promise<{ exam: QuestionSet }> {
  const response = await fetch(`${API_BASE}/syllabus/exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to generate exam');
  return response.json();
}

// Generate quick revision
export async function generateRevision(params: {
  syllabusId: string;
  topicIds?: string[];
}): Promise<{ revision: QuestionSet }> {
  const response = await fetch(`${API_BASE}/syllabus/revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to generate revision');
  return response.json();
}

// Generate adaptive test
export async function generateAdaptiveTest(params: {
  syllabusId: string;
  userId: string;
}): Promise<{ assessment: QuestionSet }> {
  const response = await fetch(`${API_BASE}/syllabus/adaptive-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to generate adaptive test');
  return response.json();
}

// Submit assessment
export async function submitAssessment(params: {
  questionSetId: string;
  userId: string;
  answers: Record<string, string>;
}): Promise<AssessmentResult> {
  const response = await fetch(`${API_BASE}/syllabus/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) throw new Error('Failed to submit assessment');
  return response.json();
}

// Get topic details
export async function getTopicDetails(syllabusId: string, topicId: string): Promise<{
  topic: Topic & {
    detailedContent: string;
    keyConceptsForExam: string[];
    commonMistakes: string[];
    studyTips: string[];
  };
}> {
  const response = await fetch(`${API_BASE}/syllabus/${syllabusId}/topic/${topicId}`);
  if (!response.ok) throw new Error('Failed to fetch topic details');
  return response.json();
}
