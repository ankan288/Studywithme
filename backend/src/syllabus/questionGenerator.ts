// Question Generator - Creates exam-ready questions from syllabus topics
import { geminiClient } from '../ai/geminiClient';
import { Topic, ParsedSyllabus } from './syllabusParser';

export interface Question {
  id: string;
  topicId: string;
  topicName: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'numerical' | 'true_false' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  marks: number;
  timeEstimate: number; // seconds
  tags: string[];
  previousYearAppearance?: string; // e.g., "2023 Board Exam"
}

export interface QuestionSet {
  id: string;
  syllabusId: string;
  subjectName: string;
  topicId?: string;
  type: 'topic_practice' | 'chapter_test' | 'mock_exam' | 'quick_revision';
  totalQuestions: number;
  totalMarks: number;
  duration: number; // minutes
  questions: Question[];
  createdAt: Date;
}

export async function generateTopicQuestions(
  topic: Topic,
  subjectName: string,
  options: {
    count?: number;
    types?: Question['type'][];
    difficulty?: Question['difficulty'];
    includeExamStyle?: boolean;
  } = {}
): Promise<Question[]> {
  const {
    count = 10,
    types = ['mcq', 'short_answer', 'long_answer'],
    difficulty,
    includeExamStyle = true
  } = options;

  const prompt = `You are an expert exam paper setter for ${subjectName}.

Topic: ${topic.name}
Description: ${topic.description}
Subtopics: ${topic.subtopics.join(', ')}

Generate ${count} high-quality exam questions for this topic.

Requirements:
- Question types to include: ${types.join(', ')}
- ${difficulty ? `All questions should be ${difficulty} difficulty` : 'Mix of easy (30%), medium (50%), and hard (20%) questions'}
- ${includeExamStyle ? 'Include questions similar to board/university exam patterns' : ''}
- Questions should test conceptual understanding, not just memorization
- Include numerical problems if applicable
- Each question should have a detailed explanation

Return as JSON array:
\`\`\`json
[
  {
    "type": "mcq",
    "difficulty": "easy|medium|hard",
    "question": "Clear question text",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "A) option1",
    "explanation": "Detailed explanation of why this is correct",
    "marks": 1,
    "timeEstimate": 60,
    "tags": ["subtopic1", "concept1"]
  },
  {
    "type": "short_answer",
    "difficulty": "medium",
    "question": "Question requiring brief answer",
    "correctAnswer": "Model answer (2-3 sentences)",
    "explanation": "How to approach this question",
    "marks": 2,
    "timeEstimate": 120,
    "tags": ["subtopic2"]
  },
  {
    "type": "long_answer",
    "difficulty": "hard",
    "question": "Detailed question requiring comprehensive answer",
    "correctAnswer": "Complete model answer with all points",
    "explanation": "Key points that must be covered",
    "marks": 5,
    "timeEstimate": 300,
    "tags": ["subtopic1", "subtopic3"]
  },
  {
    "type": "numerical",
    "difficulty": "medium",
    "question": "Problem with numerical answer",
    "correctAnswer": "Step-by-step solution with final answer",
    "explanation": "Concept being tested and common mistakes",
    "marks": 3,
    "timeEstimate": 180,
    "tags": ["calculation", "formula"]
  }
]
\`\`\`

Create diverse, exam-relevant questions that thoroughly test understanding of the topic.`;

  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to generate questions');
  }
  
  const questionsData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  return questionsData.map((q: any, index: number) => ({
    id: `q-${topic.id}-${index + 1}-${Date.now()}`,
    topicId: topic.id,
    topicName: topic.name,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    marks: q.marks || (q.type === 'mcq' ? 1 : q.type === 'short_answer' ? 2 : 5),
    timeEstimate: q.timeEstimate || 60,
    tags: q.tags || []
  }));
}

export async function generateMockExam(
  syllabus: ParsedSyllabus,
  options: {
    duration?: number; // minutes
    totalMarks?: number;
    pattern?: 'board' | 'competitive' | 'university' | 'custom';
    focusTopics?: string[];
  } = {}
): Promise<QuestionSet> {
  const {
    duration = 180,
    totalMarks = 100,
    pattern = 'board',
    focusTopics
  } = options;

  const topicsToInclude = focusTopics 
    ? syllabus.topics.filter(t => focusTopics.includes(t.id) || focusTopics.includes(t.name))
    : syllabus.topics;

  const prompt = `You are an expert exam paper setter creating a complete ${pattern} examination paper.

Subject: ${syllabus.subjectName}
Topics to cover: ${topicsToInclude.map(t => t.name).join(', ')}
Total Duration: ${duration} minutes
Total Marks: ${totalMarks}
${syllabus.examPattern ? `Exam Pattern: ${JSON.stringify(syllabus.examPattern)}` : ''}

Create a complete, balanced exam paper following standard ${pattern} exam patterns.

Requirements:
1. Cover all mentioned topics proportionally
2. Include mix of question types (MCQ, Short Answer, Long Answer, Numericals)
3. Progressive difficulty (start easier, end harder)
4. Clear marking scheme
5. Questions should be exam-ready and professionally written

Return as JSON:
\`\`\`json
{
  "sections": [
    {
      "name": "Section A - Multiple Choice",
      "instructions": "Choose the correct option",
      "marks": 20,
      "questions": [
        {
          "type": "mcq",
          "difficulty": "easy",
          "topic": "Topic Name",
          "question": "Question text",
          "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
          "correctAnswer": "A) opt1",
          "explanation": "Why this is correct",
          "marks": 1
        }
      ]
    },
    {
      "name": "Section B - Short Answer",
      "instructions": "Answer in 2-3 sentences",
      "marks": 30,
      "questions": [...]
    },
    {
      "name": "Section C - Long Answer",
      "instructions": "Answer in detail",
      "marks": 50,
      "questions": [...]
    }
  ]
}
\`\`\``;

  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to generate mock exam');
  }
  
  const examData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  // Flatten all questions from sections
  const allQuestions: Question[] = [];
  let questionIndex = 0;
  
  for (const section of examData.sections || []) {
    for (const q of section.questions || []) {
      allQuestions.push({
        id: `exam-q-${++questionIndex}-${Date.now()}`,
        topicId: syllabus.topics.find(t => t.name === q.topic)?.id || 'general',
        topicName: q.topic || 'General',
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        timeEstimate: q.marks * 60,
        tags: [section.name]
      });
    }
  }

  return {
    id: `exam-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    syllabusId: `syllabus-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}`,
    subjectName: syllabus.subjectName,
    type: 'mock_exam',
    totalQuestions: allQuestions.length,
    totalMarks,
    duration,
    questions: allQuestions,
    createdAt: new Date()
  };
}

export async function generateQuickRevision(
  syllabus: ParsedSyllabus,
  topicIds?: string[]
): Promise<QuestionSet> {
  const topics = topicIds 
    ? syllabus.topics.filter(t => topicIds.includes(t.id))
    : syllabus.topics;

  const questions: Question[] = [];
  
  // Generate 2-3 quick questions per topic
  for (const topic of topics.slice(0, 5)) { // Limit to 5 topics for quick revision
    const topicQuestions = await generateTopicQuestions(topic, syllabus.subjectName, {
      count: 3,
      types: ['mcq', 'true_false', 'fill_blank'],
      difficulty: 'easy'
    });
    questions.push(...topicQuestions);
  }

  return {
    id: `revision-${Date.now()}`,
    syllabusId: `syllabus-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}`,
    subjectName: syllabus.subjectName,
    type: 'quick_revision',
    totalQuestions: questions.length,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    duration: 15,
    questions,
    createdAt: new Date()
  };
}

export async function generateAdaptiveAssessment(
  syllabus: ParsedSyllabus,
  userPerformance: {
    strongTopics: string[];
    weakTopics: string[];
    averageScore: number;
    recentMistakes: string[];
  }
): Promise<QuestionSet> {
  const prompt = `Create a personalized assessment based on this student's performance.

Subject: ${syllabus.subjectName}
Student Performance:
- Strong Topics: ${userPerformance.strongTopics.join(', ')}
- Weak Topics: ${userPerformance.weakTopics.join(', ')}
- Average Score: ${userPerformance.averageScore}%
- Recent Mistakes: ${userPerformance.recentMistakes.join(', ')}

Create 15 questions that:
1. Focus 60% on weak topics to help improvement
2. Include 30% medium difficulty from strong topics for confidence
3. Include 10% challenging questions from strong topics for growth
4. Address specific mistake patterns

Return as JSON array of questions with type, difficulty, topic, question, correctAnswer, explanation, marks.`;

  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[[\s\S]*\]/);
  
  let questions: Question[] = [];
  
  if (jsonMatch) {
    const questionsData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    questions = questionsData.map((q: any, index: number) => ({
      id: `adaptive-q-${index + 1}-${Date.now()}`,
      topicId: syllabus.topics.find(t => t.name === q.topic)?.id || 'general',
      topicName: q.topic || 'General',
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: q.marks || 2,
      timeEstimate: (q.marks || 2) * 60,
      tags: ['adaptive', q.topic]
    }));
  }

  return {
    id: `adaptive-${Date.now()}`,
    syllabusId: `syllabus-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}`,
    subjectName: syllabus.subjectName,
    type: 'topic_practice',
    totalQuestions: questions.length,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    duration: 30,
    questions,
    createdAt: new Date()
  };
}
