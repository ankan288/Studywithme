import { DepthLevel, TaskMode, AssignmentStructure } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = {
  chat: {
    sendMessage: async (message: string, depth: DepthLevel, mode: TaskMode) => {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, depth, mode })
      });
      const data = await response.json();
      return data.data || data;
    },
    initialize: async (apiKey: string) => {
      const response = await fetch(`${API_URL}/api/chat/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      return response.json();
    }
  },
  assignment: {
    generate: async (topic: string, depth: DepthLevel) => {
      const response = await fetch(`${API_URL}/api/assignments/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, depth })
      });
      return response.json();
    },
    evaluate: async (assignment: AssignmentStructure, answer: string) => {
      const response = await fetch(`${API_URL}/api/assignments/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment, answer })
      });
      return response.json();
    }
  },
  progress: {
    getSummary: async (studentId: string) => {
      const response = await fetch(`${API_URL}/api/progress/summary/${studentId}`);
      return response.json();
    }
  }
};