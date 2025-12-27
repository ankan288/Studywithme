export enum DepthLevel {
  Core = 'Core',
  Applied = 'Applied',
  Mastery = 'Mastery'
}

export enum TaskMode {
  Learning = 'Learning',
  Assignment = 'Assignment'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    depth?: DepthLevel;
    mode?: TaskMode;
    isAssignment?: boolean;
  };
}
