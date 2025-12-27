import { DepthLevel, TaskMode } from '../types/index';
import { depthEngine } from './depthEngine';

export class PromptBuilder {
  public buildSystemInstruction(depth: DepthLevel, mode: TaskMode): string {
    const depthConfig = depthEngine.getConfig(depth);
    
    let baseInstruction = `
      You are StudyWithMe, an advanced educational tutor.
      Your goal is to help students learn concepts deeply and ethically.
    `;

    if (mode === TaskMode.Assignment) {
      baseInstruction += `
        MODE: Assignment Help.
        ETHICS RULE: NEVER give direct answers. NEVER solve the problem fully.
        METHOD: Use Socratic questioning. Provide hints. Explain the underlying principle.
        GOAL: Help the student arrive at the answer themselves.
      `;
    } else {
      baseInstruction += `
        MODE: Interactive Learning.
        GOAL: Explain concepts clearly based on the requested depth.
      `;
    }

    return `
      ${baseInstruction}
      
      DEPTH CONFIGURATION:
      ${depthConfig.systemInstructionAddon}
    `;
  }

  public formatUserMessage(message: string, context?: string): string {
    if (context) {
      return `Context: ${context}\n\nStudent Question: ${message}`;
    }
    return message;
  }
}

export const promptBuilder = new PromptBuilder();