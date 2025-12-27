import { DepthLevel } from './chat.types';

export interface LearningEvent {
  studentId: string;
  topic: string;
  eventType: 'EXPLANATION' | 'ASSIGNMENT_ATTEMPT' | 'ASSIGNMENT_COMPLETE';
  depth: DepthLevel;
  score?: number;
  mistakes?: string[];
  timeSpentSeconds: number;
  timestamp: string;
}

export interface TopicMetrics {
  topic: string;
  masteryScore: number;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  attempts: number;
  lastDepth: DepthLevel;
  lastInteraction: string;
  commonMistakes: string[];
}

export interface StudentProfile {
  studentId: string;
  topics: Record<string, TopicMetrics>;
  overallStats: {
    totalSessions: number;
    highestDepthReached: DepthLevel;
    averageReasoningScore: number;
  };
}

export interface LearningInsight {
  type: 'STRENGTH' | 'WEAKNESS' | 'RECOMMENDATION';
  topic: string;
  message: string;
}
