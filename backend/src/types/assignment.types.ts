import { DepthLevel } from './depth.types';

export interface AssignmentStructure {
  title: string;
  objective: string;
  difficulty: DepthLevel;
  questions: string[];
  hints: string[];
}

export interface AssignmentFeedback {
  conceptualScore: number; // 0-100
  feedback: string;
  misconceptions: string[];
  nextSteps: string;
}