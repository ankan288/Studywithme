// Learning Path Generator - Creates personalized learning journeys from syllabus
import { ParsedSyllabus, Topic } from './syllabusParser';
import { geminiClient } from '../ai/geminiClient';

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
  estimatedTime: number; // minutes
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
  createdAt: Date;
  totalModules: number;
  completedModules: number;
  currentModuleId: string | null;
  modules: LearningModule[];
  progress: {
    percentage: number;
    timeSpent: number; // minutes
    lastAccessed: Date;
  };
  adaptiveSettings: {
    pace: 'slow' | 'normal' | 'fast';
    depthPreference: 'basic' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    weakAreas: string[];
  };
}

export async function generateLearningPath(
  syllabus: ParsedSyllabus,
  userId: string,
  preferences?: {
    pace?: 'slow' | 'normal' | 'fast';
    depth?: 'basic' | 'detailed' | 'comprehensive';
    focusTopics?: string[];
  }
): Promise<LearningPath> {
  const pathId = `path-${Date.now()}-${userId.slice(0, 8)}`;
  
  // Generate modules for each topic
  const modules: LearningModule[] = [];
  let moduleNumber = 1;
  
  for (const topic of syllabus.topics) {
    const topicModules = await generateTopicModules(
      topic, 
      syllabus.subjectName,
      preferences?.depth || 'detailed'
    );
    
    topicModules.forEach(module => {
      module.moduleNumber = moduleNumber++;
      module.status = modules.length === 0 ? 'available' : 'locked';
      modules.push(module);
    });
  }
  
  return {
    id: pathId,
    userId,
    syllabusId: `syllabus-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}`,
    subjectName: syllabus.subjectName,
    createdAt: new Date(),
    totalModules: modules.length,
    completedModules: 0,
    currentModuleId: modules[0]?.id || null,
    modules,
    progress: {
      percentage: 0,
      timeSpent: 0,
      lastAccessed: new Date()
    },
    adaptiveSettings: {
      pace: preferences?.pace || 'normal',
      depthPreference: preferences?.depth || 'detailed',
      focusAreas: preferences?.focusTopics || [],
      weakAreas: []
    }
  };
}

async function generateTopicModules(
  topic: Topic,
  subjectName: string,
  depth: 'basic' | 'detailed' | 'comprehensive'
): Promise<LearningModule[]> {
  const prompt = `You are an expert educator creating learning content for: ${subjectName}

Topic: ${topic.name}
Description: ${topic.description}
Subtopics: ${topic.subtopics.join(', ')}
Difficulty: ${topic.difficulty}
Depth Level: ${depth}

Create ${depth === 'basic' ? '1-2' : depth === 'detailed' ? '2-3' : '3-4'} learning modules that cover this topic thoroughly.

Each module should be a focused, digestible lesson that a student can complete in 15-30 minutes.

Return as JSON array:
\`\`\`json
[
  {
    "title": "Module Title",
    "objectives": ["objective1", "objective2"],
    "content": {
      "explanation": "Clear, detailed explanation (3-5 paragraphs with proper formatting)",
      "examples": ["example1 with solution", "example2 with solution"],
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "formulae": ["formula1 if applicable"],
      "diagrams": ["description of helpful diagram if applicable"]
    },
    "estimatedTime": 20,
    "exercises": [
      {
        "type": "concept_check",
        "question": "Quick concept check question",
        "answer": "Detailed answer"
      },
      {
        "type": "practice",
        "question": "Practice problem",
        "answer": "Step-by-step solution"
      },
      {
        "type": "application",
        "question": "Application/real-world problem",
        "answer": "Complete solution with explanation"
      }
    ]
  }
]
\`\`\`

Make the content engaging, clear, and exam-focused. Include practical examples.`;

  const response = await geminiClient.generateContent(prompt);
  const text = response.response.text();
  
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // Return a basic module if parsing fails
    return [{
      id: `module-${topic.id}-1`,
      topicId: topic.id,
      topicName: topic.name,
      moduleNumber: 0,
      title: topic.name,
      objectives: [topic.description],
      content: {
        explanation: topic.description,
        examples: [],
        keyPoints: topic.subtopics
      },
      estimatedTime: topic.estimatedHours * 60,
      exercises: [],
      status: 'locked'
    }];
  }
  
  const modulesData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  return modulesData.map((moduleData: any, index: number) => ({
    id: `module-${topic.id}-${index + 1}`,
    topicId: topic.id,
    topicName: topic.name,
    moduleNumber: 0, // Will be set later
    title: moduleData.title,
    objectives: moduleData.objectives || [],
    content: {
      explanation: moduleData.content?.explanation || '',
      examples: moduleData.content?.examples || [],
      keyPoints: moduleData.content?.keyPoints || [],
      formulae: moduleData.content?.formulae || [],
      diagrams: moduleData.content?.diagrams || []
    },
    estimatedTime: moduleData.estimatedTime || 20,
    exercises: moduleData.exercises || [],
    status: 'locked' as const
  }));
}

export async function adaptLearningPath(
  path: LearningPath,
  performanceData: {
    moduleId: string;
    score: number;
    timeSpent: number;
    incorrectAreas: string[];
  }
): Promise<LearningPath> {
  const updatedPath = { ...path };
  
  // Update module status
  const moduleIndex = path.modules.findIndex(m => m.id === performanceData.moduleId);
  if (moduleIndex !== -1) {
    updatedPath.modules[moduleIndex].status = 'completed';
    updatedPath.completedModules++;
    
    // Unlock next module
    if (moduleIndex + 1 < path.modules.length) {
      updatedPath.modules[moduleIndex + 1].status = 'available';
      updatedPath.currentModuleId = updatedPath.modules[moduleIndex + 1].id;
    }
  }
  
  // Update progress
  updatedPath.progress = {
    percentage: (updatedPath.completedModules / updatedPath.totalModules) * 100,
    timeSpent: path.progress.timeSpent + performanceData.timeSpent,
    lastAccessed: new Date()
  };
  
  // Track weak areas
  if (performanceData.score < 70) {
    updatedPath.adaptiveSettings.weakAreas = [
      ...new Set([...path.adaptiveSettings.weakAreas, ...performanceData.incorrectAreas])
    ];
  }
  
  // Adjust pace based on performance
  if (performanceData.score >= 90 && performanceData.timeSpent < 15) {
    updatedPath.adaptiveSettings.pace = 'fast';
  } else if (performanceData.score < 60) {
    updatedPath.adaptiveSettings.pace = 'slow';
  }
  
  return updatedPath;
}

export function getNextRecommendedModule(path: LearningPath): LearningModule | null {
  // Find first available module
  const available = path.modules.find(m => m.status === 'available');
  if (available) return available;
  
  // If all completed, suggest review of weak areas
  if (path.adaptiveSettings.weakAreas.length > 0) {
    const weakModule = path.modules.find(m => 
      path.adaptiveSettings.weakAreas.some(area => 
        m.title.toLowerCase().includes(area.toLowerCase()) ||
        m.topicName.toLowerCase().includes(area.toLowerCase())
      )
    );
    if (weakModule) return weakModule;
  }
  
  return null;
}
