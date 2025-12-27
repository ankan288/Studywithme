// Syllabus Parser - Extracts structured curriculum from user input
import { geminiClient } from '../ai/geminiClient';

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

export interface SyllabusInput {
  type: 'subject_name' | 'syllabus_text' | 'syllabus_file';
  content: string;
  additionalContext?: string;
  targetLevel?: 'school' | 'undergraduate' | 'graduate' | 'professional';
  examType?: string; // e.g., "CBSE", "JEE", "GATE", "University Exam"
}

export async function parseSyllabus(input: SyllabusInput): Promise<ParsedSyllabus> {
  const prompt = buildSyllabusParsePrompt(input);
  
  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  // Extract JSON from response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse syllabus structure from AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]) as ParsedSyllabus;
  
  // Add unique IDs to topics
  parsed.topics = parsed.topics.map((topic, index) => ({
    ...topic,
    id: `topic-${index + 1}-${topic.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
    order: index + 1
  }));
  
  return parsed;
}

function buildSyllabusParsePrompt(input: SyllabusInput): string {
  const levelContext = input.targetLevel 
    ? `Target education level: ${input.targetLevel}` 
    : '';
  
  const examContext = input.examType 
    ? `Exam/Board type: ${input.examType}` 
    : '';

  if (input.type === 'subject_name') {
    return `You are an expert curriculum designer. Create a comprehensive syllabus structure for the subject: "${input.content}"

${levelContext}
${examContext}
${input.additionalContext ? `Additional context: ${input.additionalContext}` : ''}

Generate a complete, well-structured syllabus with topics ordered from foundational to advanced.

Return ONLY a JSON object in this exact format:
\`\`\`json
{
  "subjectName": "Full Subject Name",
  "description": "Brief description of the subject and what students will learn",
  "totalTopics": <number>,
  "estimatedDuration": "X weeks/months",
  "learningObjectives": ["objective1", "objective2", ...],
  "topics": [
    {
      "name": "Topic Name",
      "description": "What this topic covers",
      "subtopics": ["subtopic1", "subtopic2", ...],
      "estimatedHours": <number>,
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["prerequisite topic names if any"]
    }
  ],
  "examPattern": {
    "totalMarks": 100,
    "duration": "3 hours",
    "sections": [
      {"name": "Section A", "marks": 20, "questionType": "MCQ"},
      {"name": "Section B", "marks": 40, "questionType": "Short Answer"},
      {"name": "Section C", "marks": 40, "questionType": "Long Answer"}
    ]
  }
}
\`\`\`

Create 8-15 well-structured topics covering the entire subject comprehensively.`;
  }

  // For syllabus text input
  return `You are an expert curriculum designer. Analyze and structure the following syllabus content into a organized learning path.

SYLLABUS CONTENT:
"""
${input.content}
"""

${levelContext}
${examContext}
${input.additionalContext ? `Additional context: ${input.additionalContext}` : ''}

Extract all topics, organize them logically, and create a structured curriculum.

Return ONLY a JSON object in this exact format:
\`\`\`json
{
  "subjectName": "Extracted or inferred subject name",
  "description": "Brief description of the subject",
  "totalTopics": <number>,
  "estimatedDuration": "X weeks/months",
  "learningObjectives": ["objective1", "objective2", ...],
  "topics": [
    {
      "name": "Topic Name",
      "description": "What this topic covers",
      "subtopics": ["subtopic1", "subtopic2", ...],
      "estimatedHours": <number>,
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["prerequisite topic names if any"]
    }
  ],
  "examPattern": {
    "totalMarks": 100,
    "duration": "3 hours",
    "sections": [
      {"name": "Section A", "marks": 20, "questionType": "MCQ"},
      {"name": "Section B", "marks": 40, "questionType": "Short Answer"},
      {"name": "Section C", "marks": 40, "questionType": "Long Answer"}
    ]
  }
}
\`\`\``;
}

export async function enrichTopicDetails(topic: Topic, subjectContext: string): Promise<Topic & { 
  detailedContent: string;
  keyConceptsForExam: string[];
  commonMistakes: string[];
  studyTips: string[];
}> {
  const prompt = `You are an expert educator. Provide enriched details for this topic.

Subject: ${subjectContext}
Topic: ${topic.name}
Description: ${topic.description}
Subtopics: ${topic.subtopics.join(', ')}

Provide:
1. Detailed content explanation (2-3 paragraphs)
2. Key concepts that are important for exams
3. Common mistakes students make
4. Study tips for this topic

Return as JSON:
\`\`\`json
{
  "detailedContent": "...",
  "keyConceptsForExam": ["concept1", "concept2", ...],
  "commonMistakes": ["mistake1", "mistake2", ...],
  "studyTips": ["tip1", "tip2", ...]
}
\`\`\``;

  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to get enriched topic details');
  }
  
  const enriched = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  return {
    ...topic,
    ...enriched
  };
}
