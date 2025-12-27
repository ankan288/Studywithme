import { DepthLevel, TaskMode } from './depth.types';
import { AssignmentStructure, AssignmentFeedback } from './assignment.types';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    depth?: DepthLevel;
    mode?: TaskMode;
    isAssignment?: boolean;
    assignmentData?: AssignmentStructure;
    feedbackData?: AssignmentFeedback;
  };
}